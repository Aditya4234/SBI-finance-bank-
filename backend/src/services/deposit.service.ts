import { AppError, NotFoundError } from '../utils/errors';
import { getPersonalDb } from '../config/personal-db';
import { v4 as uuidv4 } from 'uuid';

export class DepositService {
  async openFixedDeposit(
    userId: string,
    accountId: string,
    amount: number,
    tenureMonths: number,
    interestRate: number,
    nominee?: { name: string; relation: string },
  ) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: { id: accountId, userId, status: { not: 'CLOSED' as any } },
    });
    if (!account) throw new NotFoundError('Account');

    if (account.balance < amount) {
      throw new AppError('Insufficient balance', 400);
    }

    const fdNumber = `SBI_FD_${uuidv4().substring(0, 8).toUpperCase()}`;
    const r = interestRate / 100;
    const n = 4;
    const t = tenureMonths / 12;
    const maturityAmount = Math.round(amount * Math.pow(1 + r / n, n * t) * 100) / 100;
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

    const fd = await db.fixedDeposit.create({
      data: {
        userId,
        accountId,
        fdNumber,
        amount,
        interestRate,
        tenure: tenureMonths,
        maturityAmount,
        maturityDate,
        nomineeName: nominee?.name,
        nomineeRelation: nominee?.relation,
      },
    });

    await db.personalAccount.update({
      where: { id: accountId },
      data: { balance: { decrement: amount } },
    });

    return fd;
  }

  async getUserFixedDeposits(userId: string) {
    const db = getPersonalDb();
    return db.fixedDeposit.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async getFixedDepositById(fdId: string, userId: string) {
    const db = getPersonalDb();
    const fd = await db.fixedDeposit.findFirst({ where: { id: fdId, userId } });
    if (!fd) throw new NotFoundError('Fixed Deposit');
    return fd;
  }

  async closeFixedDeposit(fdId: string, userId: string, premature = false) {
    const db = getPersonalDb();
    const fd = await db.fixedDeposit.findFirst({ where: { id: fdId, userId } });
    if (!fd) throw new NotFoundError('Fixed Deposit');
    if (fd.status !== 'ACTIVE') throw new AppError('FD is not active', 400);

    const payoutAmount = premature ? Math.round(fd.amount * 0.98 * 100) / 100 : fd.maturityAmount;

    await db.fixedDeposit.update({
      where: { id: fdId },
      data: {
        status: premature ? 'PREMATURE_CLOSED' : 'CLOSED',
        closedDate: new Date(),
      },
    });

    await db.personalAccount.update({
      where: { id: fd.accountId },
      data: { balance: { increment: payoutAmount } },
    });

    return { fdId, status: premature ? 'PREMATURE_CLOSED' : 'CLOSED', payoutAmount };
  }

  async openRecurringDeposit(
    userId: string,
    accountId: string,
    monthlyAmount: number,
    tenureMonths: number,
    interestRate: number,
    nominee?: { name: string; relation: string },
  ) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: { id: accountId, userId, status: { not: 'CLOSED' as any } },
    });
    if (!account) throw new NotFoundError('Account');

    const rdNumber = `SBI_RD_${uuidv4().substring(0, 8).toUpperCase()}`;
    const r = interestRate / 100;
    const maturityAmount = Math.round(monthlyAmount * ((Math.pow(1 + r / 12, tenureMonths) - 1) / (1 - Math.pow(1 + r / 12, -1))) * 100) / 100;
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

    const rd = await db.recurringDeposit.create({
      data: {
        userId,
        accountId,
        rdNumber,
        monthlyAmount,
        interestRate,
        tenure: tenureMonths,
        maturityAmount,
        maturityDate,
        nomineeName: nominee?.name,
        nomineeRelation: nominee?.relation,
      },
    });

    return rd;
  }

  async getUserRecurringDeposits(userId: string) {
    const db = getPersonalDb();
    return db.recurringDeposit.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async getRecurringDepositById(rdId: string, userId: string) {
    const db = getPersonalDb();
    const rd = await db.recurringDeposit.findFirst({ where: { id: rdId, userId } });
    if (!rd) throw new NotFoundError('Recurring Deposit');
    return rd;
  }

  async makeRdPayment(rdId: string, userId: string) {
    const db = getPersonalDb();
    const rd = await db.recurringDeposit.findFirst({ where: { id: rdId, userId } });
    if (!rd) throw new NotFoundError('Recurring Deposit');
    if (rd.status !== 'ACTIVE') throw new AppError('RD is not active', 400);

    const account = await db.personalAccount.findFirst({ where: { id: rd.accountId, userId } });
    if (!account) throw new NotFoundError('Account');
    if (account.balance < rd.monthlyAmount) throw new AppError('Insufficient balance', 400);

    const newInstallmentsPaid = rd.installmentsPaid + 1;
    const newTotalDeposits = Math.round((rd.totalDeposits + rd.monthlyAmount) * 100) / 100;
    let updateData: any = {
      installmentsPaid: newInstallmentsPaid,
      totalDeposits: newTotalDeposits,
      lastPaidDate: new Date(),
    };

    if (newInstallmentsPaid >= rd.tenure) {
      updateData.status = 'MATURED';
      updateData.maturityPaidDate = new Date();
    }

    await db.recurringDeposit.update({ where: { id: rdId }, data: updateData });

    await db.personalAccount.update({
      where: { id: rd.accountId },
      data: { balance: { decrement: rd.monthlyAmount } },
    });

    return { rdId, installmentsPaid: newInstallmentsPaid, totalDeposits: newTotalDeposits, status: updateData.status || 'ACTIVE' };
  }

  async closeRecurringDeposit(rdId: string, userId: string, premature = false) {
    const db = getPersonalDb();
    const rd = await db.recurringDeposit.findFirst({ where: { id: rdId, userId } });
    if (!rd) throw new NotFoundError('Recurring Deposit');
    if (!['ACTIVE', 'MATURED'].includes(rd.status)) throw new AppError('RD cannot be closed', 400);

    const payoutAmount = premature
      ? Math.round(rd.totalDeposits * 0.97 * 100) / 100
      : rd.maturityAmount;

    await db.recurringDeposit.update({
      where: { id: rdId },
      data: {
        status: premature ? 'CLOSED' : 'CLOSED',
        closedDate: new Date(),
      },
    });

    await db.personalAccount.update({
      where: { id: rd.accountId },
      data: { balance: { increment: payoutAmount } },
    });

    return { rdId, status: 'CLOSED', payoutAmount };
  }
}

export const depositService = new DepositService();
