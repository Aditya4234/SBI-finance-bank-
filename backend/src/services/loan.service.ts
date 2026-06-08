import { AppError, NotFoundError } from '../utils/errors';
import { generateTransactionId, calculateEmi } from '../utils/helpers';
import { queueService } from './queue.service';
import { getPersonalDb } from '../config/personal-db';

const INTEREST_RATES: Record<string, number> = {
  PERSONAL: 10.5,
  HOME: 8.5,
  CAR: 9.0,
  EDUCATION: 7.5,
  BUSINESS: 12.0,
  GOLD: 7.0,
  MORTGAGE: 9.5,
  OVERDRAFT: 13.0,
};

export class LoanService {
  async applyForLoan(userId: string, loanData: {
    loanType: string;
    amount: number;
    tenure: number;
    purpose?: string;
    accountNumber: string;
  }) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: { userId, accountNumber: loanData.accountNumber },
    });
    if (!account) throw new NotFoundError('Account');

    const interestRate = INTEREST_RATES[loanData.loanType] || 10.5;
    const monthlyEmi = calculateEmi(loanData.amount, interestRate, loanData.tenure);
    const totalPayable = monthlyEmi * loanData.tenure;
    const totalInterest = totalPayable - loanData.amount;

    const loan = await db.loan.create({
      data: {
        userId,
        loanType: loanData.loanType as any,
        amount: loanData.amount,
        tenure: loanData.tenure,
        interestRate,
        purpose: loanData.purpose,
        monthlyEmi,
        totalInterest,
        totalPayable,
        amountPaid: 0,
        emiRemaining: loanData.tenure,
        status: 'PENDING' as any,
      },
    });

    return loan;
  }

  async getUserLoans(userId: string) {
    const db = getPersonalDb();
    return db.loan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async getLoanStatus(loanId: string, userId: string) {
    const db = getPersonalDb();
    const loan = await db.loan.findFirst({ where: { id: loanId, userId } });
    if (!loan) throw new NotFoundError('Loan');
    return loan;
  }

  async approveLoan(loanId: string, adminId: string) {
    const db = getPersonalDb();
    const loan = await db.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundError('Loan');
    if (loan.status !== 'PENDING') {
      throw new AppError('Loan is not in pending state', 400);
    }

    const updated = await db.loan.update({
      where: { id: loanId },
      data: { status: 'APPROVED' as any, approvedBy: adminId },
    });

    const user = await db.user.findUnique({ where: { id: loan.userId } });
    if (user) {
      await queueService.sendNotification({
        userId: loan.userId,
        type: 'loan',
        title: 'Loan Approved',
        message: `Your ${loan.loanType} loan of ₹${loan.amount.toLocaleString()} has been approved.`,
      });
      await queueService.sendEmail({
        type: 'loan-status',
        to: user.email,
        payload: { status: 'approved', loanType: loan.loanType, amount: loan.amount },
      });
    }

    return updated;
  }

  async disburseLoan(loanId: string, accountNumber: string) {
    const db = getPersonalDb();

    const loan = await db.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundError('Loan');
    if (loan.status !== 'APPROVED') {
      throw new AppError('Loan is not approved yet', 400);
    }

    const account = await db.personalAccount.findUnique({ where: { accountNumber } });
    if (!account) throw new NotFoundError('Account');

    await db.personalAccount.update({
      where: { id: account.id },
      data: { balance: { increment: loan.amount } },
    });

    await db.transaction.create({
      data: {
        transactionId: generateTransactionId(),
        userId: loan.userId,
        fromAccount: 'LOAN_DISBURSEMENT',
        toAccount: accountNumber,
        toName: 'Loan Disbursement',
        amount: loan.amount,
        transactionType: 'DEPOSIT' as any,
        status: 'SUCCESS' as any,
        isInternal: true,
        fee: 0,
        balanceBefore: account.balance,
        balanceAfter: account.balance + loan.amount,
        description: `${loan.loanType} loan disbursement`,
      },
    });

    return db.loan.update({
      where: { id: loanId },
      data: { status: 'DISBURSED' as any, disbursedDate: new Date() },
    });
  }

  async rejectLoan(loanId: string, adminId: string, remarks: string) {
    const db = getPersonalDb();
    const loan = await db.loan.findUnique({ where: { id: loanId } });
    if (!loan) throw new NotFoundError('Loan');
    if (loan.status !== 'PENDING') {
      throw new AppError('Loan is not in pending state', 400);
    }

    const updated = await db.loan.update({
      where: { id: loanId },
      data: { status: 'REJECTED' as any, approvedBy: adminId, remarks },
    });

    const user = await db.user.findUnique({ where: { id: loan.userId } });
    if (user) {
      await queueService.sendNotification({
        userId: loan.userId,
        type: 'loan',
        title: 'Loan Rejected',
        message: `Your ${loan.loanType} loan application has been rejected. Reason: ${remarks}`,
      });
      await queueService.sendEmail({
        type: 'loan-status',
        to: user.email,
        payload: { status: 'rejected', loanType: loan.loanType, remarks },
      });
    }

    return updated;
  }

  async getAllLoans(page = 1, limit = 20) {
    const db = getPersonalDb();

    const [total, loans] = await Promise.all([
      db.loan.count(),
      db.loan.findMany({
        include: { user: { select: { fullName: true, email: true, mobile: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { loans, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}

export const loanService = new LoanService();
