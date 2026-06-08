import { Job } from 'bull';
import { loanQueue, emailQueue, notificationQueue } from '../queues';
import { LoanJobData } from '../queues/jobTypes';
import { logger } from '../config/logger';
import { generateTransactionId, calculateEmi } from '../utils/helpers';
import { getPersonalDb } from '../config/personal-db';

export const processLoanQueue = async () => {
  loanQueue.process(async (job: Job<LoanJobData>) => {
    const { type, loanId, userId, data } = job.data;
    logger.info(`Processing loan job ${job.id}: ${type}`);

    switch (type) {
      case 'process-application':
        return processApplication(data);
      case 'disburse':
        return disburseLoan(loanId, data?.accountNumber);
      case 'emi-collection':
        return processEmiCollection();
      case 'default-check':
        return checkDefaults();
      default:
        throw new Error(`Unknown loan type: ${type}`);
    }
  });
};

async function processApplication(data?: Record<string, any>) {
  if (!data) throw new Error('Application data required');
  const db = getPersonalDb();

  const interestRates: Record<string, number> = {
    PERSONAL: 10.5, HOME: 8.5, CAR: 9.0, EDUCATION: 7.5,
    BUSINESS: 12.0, GOLD: 7.0, MORTGAGE: 9.5, OVERDRAFT: 13.0,
  };

  const interestRate = interestRates[data.loanType] || 10.5;
  const monthlyEmi = calculateEmi(data.amount, interestRate, data.tenure);
  const totalPayable = monthlyEmi * data.tenure;
  const totalInterest = totalPayable - data.amount;

  const loan = await db.loan.create({
    data: {
      userId: data.userId,
      loanType: data.loanType as any,
      amount: data.amount,
      tenure: data.tenure,
      interestRate,
      purpose: data.purpose,
      monthlyEmi,
      totalInterest,
      totalPayable,
      amountPaid: 0,
      emiRemaining: data.tenure,
      status: 'PENDING' as any,
    },
  });

  return loan;
}

async function disburseLoan(loanId?: string, accountNumber?: string) {
  if (!loanId || !accountNumber) throw new Error('Loan ID and account required');
  const db = getPersonalDb();

  const loan = await db.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new Error('Loan not found');
  if (loan.status !== 'APPROVED') throw new Error('Loan not approved');

  const account = await db.personalAccount.findUnique({ where: { accountNumber } });
  if (!account) throw new Error('Account not found');

  await db.personalAccount.update({
    where: { id: account.id },
    data: { balance: { increment: loan.amount } },
  });

  await db.loan.update({
    where: { id: loanId },
    data: { status: 'DISBURSED' as any, disbursedDate: new Date() },
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

  const user = await db.user.findUnique({ where: { id: loan.userId } });
  if (user) {
    await emailQueue.add({
      type: 'loan-status',
      to: user.email,
      payload: { status: 'disbursed', loanType: loan.loanType, amount: loan.amount },
    });
  }

  return loan;
}

async function processEmiCollection() {
  const db = getPersonalDb();
  const dueLoans = await db.loan.findMany({
    where: { status: 'DISBURSED' as any, emiRemaining: { gt: 0 } },
  });

  let collected = 0;
  for (const loan of dueLoans) {
    try {
      const account = await db.personalAccount.findFirst({
        where: { userId: loan.userId, status: 'ACTIVE' as any },
      });
      if (account && account.balance >= loan.monthlyEmi) {
        await db.personalAccount.update({
          where: { id: account.id },
          data: { balance: { decrement: loan.monthlyEmi } },
        });

        const emiRemaining = loan.emiRemaining - 1;
        const loanUpdate: any = {
          amountPaid: { increment: loan.monthlyEmi },
          emiRemaining,
        };

        if (emiRemaining === 0) {
          loanUpdate.status = 'CLOSED' as any;
          loanUpdate.closureDate = new Date();
        }

        await db.loan.update({ where: { id: loan.id }, data: loanUpdate });

        await db.transaction.create({
          data: {
            transactionId: generateTransactionId(),
            userId: loan.userId,
            fromAccount: account.accountNumber,
            toAccount: 'LOAN_REPAYMENT',
            toName: `${loan.loanType} Loan EMI`,
            amount: loan.monthlyEmi,
            transactionType: 'WITHDRAWAL' as any,
            status: 'SUCCESS' as any,
            isInternal: true,
            fee: 0,
            balanceBefore: account.balance + loan.monthlyEmi,
            balanceAfter: account.balance,
            description: `EMI payment for ${loan.loanType} loan`,
          },
        });

        collected++;
      }
    } catch (error) {
      logger.error(`EMI collection failed for loan ${loan.id}:`, error);
    }
  }

  return { emisCollected: collected, totalDue: dueLoans.length };
}

async function checkDefaults() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const db = getPersonalDb();
  const defaultedLoans = await db.loan.findMany({
    where: {
      status: 'DISBURSED' as any,
      updatedAt: { lt: threeMonthsAgo },
      emiRemaining: { gt: 0 },
    },
  });

  for (const loan of defaultedLoans) {
    await db.loan.update({
      where: { id: loan.id },
      data: { status: 'DEFAULTED' as any },
    });
  }

  return { defaultsMarked: defaultedLoans.length };
}
