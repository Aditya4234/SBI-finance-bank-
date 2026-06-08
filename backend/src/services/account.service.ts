import { AppError, NotFoundError } from '../utils/errors';
import { generateAccountNumber, generateIfscCode, generateTransactionId } from '../utils/helpers';
import { getPersonalDb } from '../config/personal-db';
import { getCorporateDb } from '../config/corporate-db';

export class AccountService {
  async openPersonalAccount(userId: string, accountData: {
    accountType: string;
    branchName: string;
    initialDeposit?: number;
    nomineeName?: string;
    nomineeRelation?: string;
  }) {
    const db = getPersonalDb();
    const accountType = accountData.accountType.toUpperCase().replace(/-/g, '_') as any;

    const existingAccount = await db.personalAccount.findFirst({
      where: {
        userId,
        accountType,
        status: { not: 'CLOSED' as any },
      },
    });

    if (existingAccount) {
      throw new AppError(`You already have an active ${accountData.accountType} account`, 409);
    }

    const account = await db.personalAccount.create({
      data: {
        userId,
        accountNumber: generateAccountNumber(),
        ifscCode: generateIfscCode(),
        accountType,
        branchName: accountData.branchName,
        branchCode: accountData.branchName.substring(0, 4).toUpperCase(),
        balance: accountData.initialDeposit || 0,
        nomineeName: accountData.nomineeName,
        nomineeRelation: accountData.nomineeRelation,
      },
    });

    if (accountData.initialDeposit && accountData.initialDeposit > 0) {
      await db.transaction.create({
        data: {
          transactionId: generateTransactionId(),
          userId,
          fromAccount: 'SYSTEM',
          toAccount: account.accountNumber,
          toName: 'Self Account Opening',
          amount: accountData.initialDeposit,
          transactionType: 'DEPOSIT' as any,
          status: 'SUCCESS' as any,
          isInternal: true,
          fee: 0,
          balanceBefore: 0,
          balanceAfter: accountData.initialDeposit,
          description: `Initial deposit for ${accountData.accountType} account`,
        },
      });
    }

    return account;
  }

  async getPersonalAccounts(userId: string) {
    const db = getPersonalDb();
    return db.personalAccount.findMany({
      where: { userId, status: { not: 'CLOSED' as any } },
    });
  }

  async getPersonalAccount(userId: string, accountId: string) {
    const db = getPersonalDb();
    const account = await db.personalAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) throw new NotFoundError('Account');
    return account;
  }

  async getBalance(userId: string, accountId: string) {
    const account = await this.getPersonalAccount(userId, accountId);
    return { accountNumber: account.accountNumber, balance: account.balance, accountType: account.accountType };
  }

  async getMiniStatement(userId: string, accountId: string) {
    const account = await this.getPersonalAccount(userId, accountId);
    const db = getPersonalDb();

    return db.transaction.findMany({
      where: {
        OR: [
          { fromAccount: account.accountNumber },
          { toAccount: account.accountNumber },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async getTransactionHistory(userId: string, accountId: string, page = 1, limit = 20) {
    const account = await this.getPersonalAccount(userId, accountId);
    const db = getPersonalDb();

    const where = {
      OR: [
        { fromAccount: account.accountNumber },
        { toAccount: account.accountNumber },
      ],
    };

    const [total, transactions] = await Promise.all([
      db.transaction.count({ where }),
      db.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { transactions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async openCorporateAccount(companyId: string, accountData: {
    accountType: string;
    branchName: string;
    initialDeposit?: number;
  }) {
    const db = getCorporateDb();
    const accountType = accountData.accountType.toUpperCase().replace(/-/g, '_') as any;

    const account = await db.corporateAccount.create({
      data: {
        companyId,
        accountNumber: generateAccountNumber(),
        ifscCode: generateIfscCode(),
        accountType,
        branchName: accountData.branchName,
        branchCode: accountData.branchName.substring(0, 4).toUpperCase(),
        balance: accountData.initialDeposit || 0,
      },
    });

    if (accountData.initialDeposit && accountData.initialDeposit > 0) {
      await db.corporateTransaction.create({
        data: {
          transactionId: generateTransactionId(),
          companyId,
          fromAccount: 'SYSTEM',
          toAccount: account.accountNumber,
          toName: 'Company Account Opening',
          amount: accountData.initialDeposit,
          transactionType: 'DEPOSIT' as any,
          status: 'SUCCESS' as any,
          isInternal: true,
          fee: 0,
          balanceBefore: 0,
          balanceAfter: accountData.initialDeposit,
        },
      });
    }

    return account;
  }

  async getCorporateAccounts(companyId: string) {
    const db = getCorporateDb();
    return db.corporateAccount.findMany({
      where: { companyId, status: 'active' },
    });
  }

  async freezeAccount(accountId: string, type: 'personal' | 'corporate') {
    if (type === 'personal') {
      const db = getPersonalDb();
      return db.personalAccount.update({
        where: { id: accountId },
        data: { status: 'FROZEN' as any },
      });
    }
    const db = getCorporateDb();
    return db.corporateAccount.update({
      where: { id: accountId },
      data: { status: 'frozen' },
    });
  }

  async unfreezeAccount(accountId: string, type: 'personal' | 'corporate') {
    if (type === 'personal') {
      const db = getPersonalDb();
      return db.personalAccount.update({
        where: { id: accountId },
        data: { status: 'ACTIVE' as any },
      });
    }
    const db = getCorporateDb();
    return db.corporateAccount.update({
      where: { id: accountId },
      data: { status: 'active' },
    });
  }

  async closeAccount(userId: string, accountId: string, reason?: string) {
    const db = getPersonalDb();
    const account = await db.personalAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) throw new NotFoundError('Account');
    if (account.status === 'CLOSED') throw new AppError('Account is already closed', 400);
    if (account.balance > 0) {
      throw new AppError('Please transfer remaining balance before closing', 400);
    }
    return db.personalAccount.update({
      where: { id: accountId },
      data: { status: 'CLOSED' as any, closedDate: new Date() },
    });
  }

  async getClosedAccounts(userId: string) {
    const db = getPersonalDb();
    return db.personalAccount.findMany({
      where: { userId, status: 'CLOSED' as any },
    });
  }
}

export const accountService = new AccountService();
