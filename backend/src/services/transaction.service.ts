import { AppError, NotFoundError } from '../utils/errors';
import { generateTransactionId } from '../utils/helpers';
import { queueService } from './queue.service';
import { getPersonalDb } from '../config/personal-db';
import { getCorporateDb } from '../config/corporate-db';
import { eventBus } from '../events/event-bus';
import { DomainEvents } from '../events/events';

interface TransferParams {
  userId: string;
  fromAccount: string;
  toAccount: string;
  toIfsc?: string;
  toName: string;
  amount: number;
  transactionType: string;
  description?: string;
  beneficiaryId?: string;
  ipAddress?: string;
  deviceId?: string;
}

export class TransactionService {
  async transfer(params: TransferParams) {
    const db = getPersonalDb();

    const fromAccount = await db.personalAccount.findFirst({
      where: {
        accountNumber: params.fromAccount,
        userId: params.userId,
        status: 'ACTIVE' as any,
      },
    });

    if (!fromAccount) throw new NotFoundError('Source account');
    if (fromAccount.balance < params.amount) {
      throw new AppError('Insufficient balance', 400);
    }

    const fee = this.calculateFee(params.amount, params.transactionType as any);
    const totalDeduction = params.amount + fee;

    if (fromAccount.balance < totalDeduction) {
      throw new AppError('Insufficient balance including fees', 400);
    }

    const toAccount = await db.personalAccount.findFirst({
      where: { accountNumber: params.toAccount },
    });

    let isInternal = false;
    if (toAccount) {
      isInternal = true;
      await db.personalAccount.update({
        where: { id: toAccount.id },
        data: { balance: { increment: params.amount } },
      });
    }

    const balanceBefore = fromAccount.balance;
    await db.personalAccount.update({
      where: { id: fromAccount.id },
      data: { balance: { decrement: totalDeduction } },
    });

    const transaction = await db.transaction.create({
      data: {
        transactionId: generateTransactionId(),
        userId: params.userId,
        fromAccount: params.fromAccount,
        toAccount: params.toAccount,
        toIfsc: params.toIfsc,
        toName: params.toName,
        amount: params.amount,
        transactionType: params.transactionType as any,
        status: 'SUCCESS' as any,
        description: params.description,
        beneficiaryId: params.beneficiaryId,
        isInternal,
        fee,
        balanceBefore,
        balanceAfter: fromAccount.balance - totalDeduction,
        processedDate: new Date(),
        ipAddress: params.ipAddress,
        deviceId: params.deviceId,
      },
    });

    if (params.beneficiaryId) {
      await db.beneficiary.update({
        where: { id: params.beneficiaryId },
        data: { isVerified: true },
      });
    }

    const user = await db.user.findUnique({ where: { id: params.userId } });

    eventBus.emit(DomainEvents.TRANSACTION_COMPLETED, {
      userId: params.userId,
      email: user?.email,
      transaction,
    });

    return transaction;
  }

  async bulkPayment(companyId: string, payments: Array<{
    toAccount: string;
    toName: string;
    amount: number;
    description?: string;
  }>, fromAccount: string) {
    const db = getCorporateDb();

    const account = await db.corporateAccount.findFirst({
      where: {
        accountNumber: fromAccount,
        companyId,
        status: 'active',
      },
    });

    if (!account) throw new NotFoundError('Corporate account');

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    if (account.balance < totalAmount) {
      throw new AppError('Insufficient balance', 400);
    }

    await db.corporateAccount.update({
      where: { id: account.id },
      data: { balance: { decrement: totalAmount } },
    });

    const transactions = [];
    for (const payment of payments) {
      const txn = await db.corporateTransaction.create({
        data: {
          transactionId: generateTransactionId(),
          companyId,
          fromAccount,
          toAccount: payment.toAccount,
          toName: payment.toName,
          amount: payment.amount,
          transactionType: 'BULK_PAYMENT' as any,
          status: 'SUCCESS' as any,
          description: payment.description,
          isInternal: false,
          fee: 0,
          balanceBefore: account.balance + totalAmount,
          balanceAfter: account.balance - (totalAmount - payment.amount),
          processedDate: new Date(),
        },
      });
      transactions.push(txn);
    }

    return transactions;
  }

  async getTransactionHistory(userId: string, page = 1, limit = 20, filters?: {
    type?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const db = getPersonalDb();
    const where: any = { userId };

    if (filters?.type) where.transactionType = filters.type;
    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = filters.fromDate;
      if (filters.toDate) where.createdAt.lte = filters.toDate;
    }

    const [total, transactions] = await Promise.all([
      db.transaction.count({ where }),
      db.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async upiPayment(params: {
    userId: string;
    fromAccount: string;
    toUpi: string;
    amount: number;
    description?: string;
    ipAddress?: string;
  }) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: {
        accountNumber: params.fromAccount,
        userId: params.userId,
        upiEnabled: true,
        status: 'ACTIVE' as any,
      },
    });

    if (!account) throw new AppError('UPI not enabled or account not found', 400);
    if (account.balance < params.amount) throw new AppError('Insufficient balance', 400);

    await db.personalAccount.update({
      where: { id: account.id },
      data: { balance: { decrement: params.amount } },
    });

    return db.transaction.create({
      data: {
        transactionId: generateTransactionId(),
        userId: params.userId,
        fromAccount: params.fromAccount,
        toAccount: params.toUpi,
        toName: params.toUpi,
        amount: params.amount,
        transactionType: 'UPI' as any,
        status: 'SUCCESS' as any,
        description: params.description,
        isInternal: false,
        fee: 0,
        balanceBefore: account.balance + params.amount,
        balanceAfter: account.balance,
        ipAddress: params.ipAddress,
        processedDate: new Date(),
      },
    });
  }

  async getUpiHistory(userId: string, page = 1, limit = 20) {
    return this.getTransactionHistory(userId, page, limit, { type: 'UPI' });
  }

  async getCorporateTransactions(companyId: string, page = 1, limit = 20) {
    const db = getCorporateDb();
    const where = { companyId };

    const [total, transactions] = await Promise.all([
      db.corporateTransaction.count({ where }),
      db.corporateTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private calculateFee(amount: number, type: string): number {
    switch (type) {
      case 'NEFT':
        return amount <= 10000 ? 2.5 : 5;
      case 'RTGS':
        return amount <= 200000 ? 15 : 40;
      case 'IMPS':
        return 5;
      default:
        return 0;
    }
  }
}

export const transactionService = new TransactionService();
