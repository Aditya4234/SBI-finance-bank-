import { AppError, NotFoundError } from '../utils/errors';
import { getPersonalDb } from '../config/personal-db';
import { generateTransactionId } from '../utils/helpers';

interface PayBillData {
  fromAccount: string;
  billType: string;
  billerName: string;
  billerAccount: string;
  amount: number;
  reference?: string;
  paymentMethod?: string;
}

interface ScheduleBillData extends PayBillData {
  scheduledDate: string;
  isRecurring?: boolean;
  frequency?: string;
}

export class BillPaymentService {
  async payBill(userId: string, data: PayBillData) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: { accountNumber: data.fromAccount, userId, status: { not: 'CLOSED' as any } },
    });
    if (!account) throw new NotFoundError('Account');
    if (account.balance < data.amount) throw new AppError('Insufficient balance', 400);

    const transactionId = generateTransactionId();

    const [transaction, billPayment] = await db.$transaction(async (tx) => {
      await tx.personalAccount.update({
        where: { id: account.id },
        data: { balance: { decrement: data.amount } },
      });

      const txRecord = await tx.transaction.create({
        data: {
          transactionId,
          userId,
          fromAccount: data.fromAccount,
          toAccount: data.billerAccount,
          toName: data.billerName,
          amount: data.amount,
          transactionType: 'BILL_PAYMENT',
          status: 'SUCCESS',
          description: `Bill payment to ${data.billerName} (${data.billType})`,
          reference: data.reference,
          balanceBefore: account.balance,
          balanceAfter: account.balance - data.amount,
          paymentDate: new Date(),
        },
      });

      const bill = await tx.billPayment.create({
        data: {
          userId,
          fromAccount: data.fromAccount,
          billType: data.billType,
          billerName: data.billerName,
          billerAccount: data.billerAccount,
          amount: data.amount,
          reference: data.reference,
          transactionId,
          status: 'PAID',
          paidDate: new Date(),
          paymentMethod: data.paymentMethod || 'ACCOUNT',
        },
      });

      return [txRecord, bill];
    });

    return { transaction, billPayment };
  }

  async recharge(userId: string, data: PayBillData) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: { accountNumber: data.fromAccount, userId, status: { not: 'CLOSED' as any } },
    });
    if (!account) throw new NotFoundError('Account');
    if (account.balance < data.amount) throw new AppError('Insufficient balance', 400);

    const transactionId = generateTransactionId();

    const [transaction, billPayment] = await db.$transaction(async (tx) => {
      await tx.personalAccount.update({
        where: { id: account.id },
        data: { balance: { decrement: data.amount } },
      });

      const txRecord = await tx.transaction.create({
        data: {
          transactionId,
          userId,
          fromAccount: data.fromAccount,
          toAccount: data.billerAccount,
          toName: data.billerName,
          amount: data.amount,
          transactionType: 'RECHARGE',
          status: 'SUCCESS',
          description: `Recharge for ${data.billerName} (${data.billType})`,
          reference: data.reference,
          balanceBefore: account.balance,
          balanceAfter: account.balance - data.amount,
          paymentDate: new Date(),
        },
      });

      const bill = await tx.billPayment.create({
        data: {
          userId,
          fromAccount: data.fromAccount,
          billType: data.billType,
          billerName: data.billerName,
          billerAccount: data.billerAccount,
          amount: data.amount,
          reference: data.reference,
          transactionId,
          status: 'PAID',
          paidDate: new Date(),
          paymentMethod: data.paymentMethod || 'ACCOUNT',
        },
      });

      return [txRecord, bill];
    });

    return { transaction, billPayment };
  }

  async getBillHistory(userId: string, page = 1, limit = 10) {
    const db = getPersonalDb();
    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      db.billPayment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.billPayment.count({ where: { userId } }),
    ]);

    return {
      bills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBillById(billId: string, userId: string) {
    const db = getPersonalDb();
    const bill = await db.billPayment.findFirst({ where: { id: billId, userId } });
    if (!bill) throw new NotFoundError('Bill payment');
    return bill;
  }

  async scheduleBillPayment(userId: string, data: ScheduleBillData) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: { accountNumber: data.fromAccount, userId, status: { not: 'CLOSED' as any } },
    });
    if (!account) throw new NotFoundError('Account');

    const scheduledDate = new Date(data.scheduledDate);
    if (scheduledDate <= new Date()) throw new AppError('Scheduled date must be in the future', 400);

    let standingInstructionId: string | undefined;

    if (data.isRecurring && data.frequency) {
      const si = await db.standingInstruction.create({
        data: {
          userId,
          fromAccount: data.fromAccount,
          toAccount: data.billerAccount,
          toName: data.billerName,
          amount: data.amount,
          frequency: data.frequency,
          startDate: scheduledDate,
          nextExecution: scheduledDate,
          description: `Recurring ${data.billType} payment to ${data.billerName}`,
        },
      });
      standingInstructionId = si.id;
    }

    const bill = await db.billPayment.create({
      data: {
        userId,
        fromAccount: data.fromAccount,
        billType: data.billType,
        billerName: data.billerName,
        billerAccount: data.billerAccount,
        amount: data.amount,
        reference: data.reference,
        status: 'PENDING',
        scheduledDate,
        isRecurring: data.isRecurring || false,
        frequency: data.frequency,
        paymentMethod: data.paymentMethod || 'ACCOUNT',
      },
    });

    return { bill, standingInstructionId };
  }

  async getPendingBills(userId: string) {
    const db = getPersonalDb();
    return db.billPayment.findMany({
      where: { userId, status: 'PENDING' },
      orderBy: { scheduledDate: 'asc' },
    });
  }
}

export const billPaymentService = new BillPaymentService();
