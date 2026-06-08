import { AppError, NotFoundError } from '../utils/errors';
import { queueService } from './queue.service';
import { getPersonalDb } from '../config/personal-db';
import { UserRole } from '../models/User';

export class AdminService {
  async getDashboardStats() {
    const db = getPersonalDb();
    const corpDb = (await import('../config/corporate-db')).getCorporateDb();

    const [
      totalCustomers,
      totalPersonalAccounts,
      totalLoans,
      pendingLoans,
      pendingKyc,
      recentTransactions,
      totalCompanies,
      totalCorporateAccounts,
    ] = await Promise.all([
      db.user.count({ where: { role: 'PERSONAL_CUSTOMER' as any } }),
      db.personalAccount.count(),
      db.loan.count(),
      db.loan.count({ where: { status: 'PENDING' as any } }),
      db.kycDocument.count({ where: { status: 'PENDING' as any } }),
      db.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      corpDb.company.count(),
      corpDb.corporateAccount.count(),
    ]);

    const depositAgg = await db.personalAccount.aggregate({
      _sum: { balance: true },
    });

    const loanAgg = await db.loan.aggregate({
      _sum: { amount: true },
      where: { status: { in: ['APPROVED' as any, 'DISBURSED' as any] } },
    });

    const corporateAgg = await corpDb.corporateAccount.aggregate({
      _sum: { balance: true },
    });

    return {
      totalCustomers,
      totalCompanies,
      totalPersonalAccounts,
      totalCorporateAccounts,
      totalLoans,
      pendingLoans,
      pendingKyc,
      totalDeposits: depositAgg._sum?.balance || 0,
      totalLoansAmount: loanAgg._sum?.amount || 0,
      totalCorporateDeposits: corporateAgg._sum?.balance || 0,
      recentTransactions,
    };
  }

  async getRevenueAnalytics(period: 'daily' | 'monthly' | 'yearly' = 'monthly') {
    const db = getPersonalDb();
    const transactions = await db.transaction.findMany({
      where: {
        status: 'SUCCESS' as any,
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'asc' },
    });

    const groupFormat: Record<string, (d: Date) => string> = {
      daily: (d) => d.toISOString().slice(0, 10),
      monthly: (d) => d.toISOString().slice(0, 7),
      yearly: (d) => d.toISOString().slice(0, 4),
    };

    const formatFn = groupFormat[period];
    const revenueMap = new Map<string, { totalAmount: number; totalFees: number; count: number }>();

    for (const t of transactions) {
      const key = formatFn(t.createdAt);
      const existing = revenueMap.get(key) || { totalAmount: 0, totalFees: 0, count: 0 };
      existing.totalAmount += t.amount;
      existing.totalFees += t.fee;
      existing.count += 1;
      revenueMap.set(key, existing);
    }

    const revenue = Array.from(revenueMap.entries())
      .map(([date, data]) => ({ _id: date, ...data }))
      .sort((a, b) => a._id.localeCompare(b._id));

    const typeAgg = await db.transaction.groupBy({
      by: ['transactionType'],
      where: { status: 'SUCCESS' as any },
      _count: { id: true },
      _sum: { amount: true },
    });

    const transactionTypes = typeAgg.map(t => ({
      _id: t.transactionType,
      count: t._count?.id || 0,
      total: t._sum?.amount || 0,
    }));

    return { revenue, transactionTypes };
  }

  async getFraudAnalytics() {
    const db = getPersonalDb();

    const highValueTransactions = await db.transaction.count({
      where: {
        amount: { gte: 1000000 },
        status: 'SUCCESS' as any,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    const flaggedAccounts = await db.personalAccount.count({
      where: { status: 'FROZEN' as any },
    });

    return { highValueTransactions, flaggedAccounts, alerts: [] };
  }

  async getCustomers(page = 1, limit = 20, search?: string) {
    const db = getPersonalDb();
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, customers] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPendingKyc(page = 1, limit = 20) {
    const db = getPersonalDb();

    const [total, documents] = await Promise.all([
      db.kycDocument.count({ where: { status: 'PENDING' as any } }),
      db.kycDocument.findMany({
        where: { status: 'PENDING' as any },
        include: { user: { select: { fullName: true, email: true, mobile: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { documents, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async approveKyc(documentId: string, adminId: string) {
    const db = getPersonalDb();

    const doc = await db.kycDocument.update({
      where: { id: documentId },
      data: { status: 'APPROVED' as any, verifiedBy: adminId, verifiedAt: new Date() },
    });

    const allDocs = await db.kycDocument.findMany({
      where: { userId: doc.userId, status: 'APPROVED' as any },
    });

    if (allDocs.length >= 2) {
      await db.user.update({
        where: { id: doc.userId },
        data: { isKycCompleted: true },
      });
    }

    const user = await db.user.findUnique({ where: { id: doc.userId } });
    if (user) {
      await queueService.sendNotification({
        userId: doc.userId,
        type: 'kyc',
        title: 'KYC Approved',
        message: `Your ${doc.kycType} document has been approved.`,
      });

      await queueService.sendEmail({
        type: 'kyc-status',
        to: user.email,
        payload: { status: 'approved', documentType: doc.kycType },
      });
    }

    return doc;
  }

  async rejectKyc(documentId: string, adminId: string, remarks: string) {
    const db = getPersonalDb();

    const doc = await db.kycDocument.update({
      where: { id: documentId },
      data: { status: 'REJECTED' as any, verifiedBy: adminId, verifiedAt: new Date(), remarks },
    });

    const user = await db.user.findUnique({ where: { id: doc.userId } });
    if (user) {
      await queueService.sendNotification({
        userId: doc.userId,
        type: 'kyc',
        title: 'KYC Rejected',
        message: `Your ${doc.kycType} document has been rejected. Reason: ${remarks}`,
      });

      await queueService.sendEmail({
        type: 'kyc-status',
        to: user.email,
        payload: { status: 'rejected', documentType: doc.kycType, remarks },
      });
    }

    return doc;
  }

  async generateReport(type: 'customers' | 'transactions' | 'loans' | 'kyc') {
    const db = getPersonalDb();

    switch (type) {
      case 'customers':
        return db.user.findMany({
          select: { id: true, fullName: true, email: true, mobile: true, role: true, createdAt: true },
        });
      case 'transactions':
        return db.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });
      case 'loans':
        return db.loan.findMany({
          include: { user: { select: { fullName: true, email: true } } },
        });
      case 'kyc':
        return db.kycDocument.findMany({
          include: { user: { select: { fullName: true, email: true } } },
        });
      default:
        return [];
    }
  }
}

export const adminService = new AdminService();
