import { Job } from 'bull';
import { transactionQueue, notificationQueue } from '../queues';
import { TransactionJobData } from '../queues/jobTypes';
import { logger } from '../config/logger';
import { generateTransactionId } from '../utils/helpers';
import { getPersonalDb } from '../config/personal-db';
import { getCorporateDb } from '../config/corporate-db';

export const processTransactionQueue = async () => {
  transactionQueue.process(async (job: Job<TransactionJobData>) => {
    const { type, data, userId, companyId } = job.data;
    logger.info(`Processing transaction job ${job.id}: ${type}`);

    switch (type) {
      case 'process-transfer':
        return processTransfer(data, userId);
      case 'process-bulk-payment':
        return processBulkPayment(data, companyId);
      case 'process-salary':
        return processSalaryPayment(data, companyId);
      case 'process-upi':
        return processUpiPayment(data, userId);
      default:
        throw new Error(`Unknown transaction type: ${type}`);
    }
  });
};

async function processTransfer(data: any, userId?: string) {
  const db = getPersonalDb();

  const fromAccount = await db.personalAccount.findFirst({
    where: { accountNumber: data.fromAccount, userId, status: 'ACTIVE' as any },
  });

  if (!fromAccount) throw new Error('Source account not found');
  if (fromAccount.balance < data.amount + (data.fee || 0)) throw new Error('Insufficient balance');

  const balanceBefore = fromAccount.balance;
  await db.personalAccount.update({
    where: { id: fromAccount.id },
    data: { balance: { decrement: data.amount + (data.fee || 0) } },
  });

  const toAccount = await db.personalAccount.findFirst({
    where: { accountNumber: data.toAccount },
  });

  if (toAccount) {
    await db.personalAccount.update({
      where: { id: toAccount.id },
      data: { balance: { increment: data.amount } },
    });
  }

  const transaction = await db.transaction.create({
    data: {
      transactionId: generateTransactionId(),
      userId,
      fromAccount: data.fromAccount,
      toAccount: data.toAccount,
      toName: data.toName,
      amount: data.amount,
      transactionType: (data.transactionType || 'NEFT') as any,
      status: 'SUCCESS' as any,
      fee: data.fee || 0,
      balanceBefore,
      balanceAfter: fromAccount.balance - (data.amount + (data.fee || 0)),
      description: data.description,
      processedDate: new Date(),
    },
  });

  await notificationQueue.add({
    userId,
    type: 'transaction',
    title: 'Transaction Successful',
    message: `₹${data.amount.toLocaleString()} transferred to ${data.toName}`,
    metadata: { transactionId: transaction.transactionId },
  });

  return transaction;
}

async function processBulkPayment(data: any, companyId?: string) {
  if (!companyId) throw new Error('Company ID required for bulk payment');
  const db = getCorporateDb();

  const account = await db.corporateAccount.findFirst({
    where: { accountNumber: data.fromAccount, companyId, status: 'active' },
  });

  if (!account) throw new Error('Corporate account not found');

  const totalAmount = data.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  if (account.balance < totalAmount) throw new Error('Insufficient balance');

  await db.corporateAccount.update({
    where: { id: account.id },
    data: { balance: { decrement: totalAmount } },
  });

  const transactions = [];
  for (const payment of data.payments) {
    const txn = await db.corporateTransaction.create({
      data: {
        transactionId: generateTransactionId(),
        companyId,
        fromAccount: data.fromAccount,
        toAccount: payment.toAccount,
        toName: payment.toName,
        amount: payment.amount,
        transactionType: 'BULK_PAYMENT' as any,
        status: 'SUCCESS' as any,
        fee: 0,
        processedDate: new Date(),
        balanceBefore: account.balance + totalAmount,
        balanceAfter: account.balance - (totalAmount - payment.amount),
        description: payment.description,
      },
    });
    transactions.push(txn);
  }

  return transactions;
}

async function processSalaryPayment(data: any, companyId?: string) {
  const { fromAccount, salaries } = data;
  return processBulkPayment({ fromAccount, payments: salaries }, companyId);
}

async function processUpiPayment(data: any, userId?: string) {
  const db = getPersonalDb();

  const account = await db.personalAccount.findFirst({
    where: { accountNumber: data.fromAccount, userId, upiEnabled: true, status: 'ACTIVE' as any },
  });

  if (!account) throw new Error('UPI account not found');
  if (account.balance < data.amount) throw new Error('Insufficient balance');

  await db.personalAccount.update({
    where: { id: account.id },
    data: { balance: { decrement: data.amount } },
  });

  return db.transaction.create({
    data: {
      transactionId: generateTransactionId(),
      userId,
      fromAccount: data.fromAccount,
      toAccount: data.toUpi,
      toName: data.toUpi,
      amount: data.amount,
      transactionType: 'UPI' as any,
      status: 'SUCCESS' as any,
      fee: 0,
      balanceBefore: account.balance + data.amount,
      balanceAfter: account.balance,
      processedDate: new Date(),
    },
  });
}
