import { AppError, NotFoundError } from '../utils/errors';
import { generateAccountNumber, generateIfscCode, generateTransactionId } from '../utils/helpers';
import { getPersonalDb } from '../config/personal-db';

export class NriAccountService {
  async openNriAccount(userId: string, data: {
    accountType: 'NRE' | 'NRO' | 'FCNR';
    branchName: string;
    branchCode?: string;
    nomineeName?: string;
    nomineeRelation?: string;
    overseasAddress: string;
    foreignCurrency?: string;
    initialDeposit?: number;
  }) {
    const db = getPersonalDb();
    const accountType = data.accountType as any;

    const existingAccount = await db.personalAccount.findFirst({
      where: {
        userId,
        accountType,
        status: { not: 'CLOSED' as any },
      },
    });

    if (existingAccount) {
      throw new AppError(`You already have an active ${data.accountType} account`, 409);
    }

    const account = await db.personalAccount.create({
      data: {
        userId,
        accountNumber: generateAccountNumber(),
        ifscCode: generateIfscCode(),
        accountType,
        branchName: data.branchName,
        branchCode: data.branchCode || data.branchName.substring(0, 4).toUpperCase(),
        balance: data.initialDeposit || 0,
        nomineeName: data.nomineeName,
        nomineeRelation: data.nomineeRelation,
        upiEnabled: data.accountType === 'NRE' ? false : true,
      },
    });

    if (data.initialDeposit && data.initialDeposit > 0) {
      await db.transaction.create({
        data: {
          transactionId: generateTransactionId(),
          userId,
          fromAccount: 'SYSTEM',
          toAccount: account.accountNumber,
          toName: 'Self NRI Account Opening',
          amount: data.initialDeposit,
          transactionType: 'DEPOSIT' as any,
          status: 'SUCCESS' as any,
          isInternal: true,
          fee: 0,
          balanceBefore: 0,
          balanceAfter: data.initialDeposit,
          description: `Initial deposit for ${data.accountType} account`,
        },
      });
    }

    return account;
  }

  async getNriAccounts(userId: string) {
    const db = getPersonalDb();
    return db.personalAccount.findMany({
      where: {
        userId,
        accountType: { in: ['NRE', 'NRO', 'FCNR'] as any },
        status: { not: 'CLOSED' as any },
      },
    });
  }

  async getNriAccountDetails(accountId: string, userId: string) {
    const db = getPersonalDb();
    const account = await db.personalAccount.findFirst({
      where: {
        id: accountId,
        userId,
        accountType: { in: ['NRE', 'NRO', 'FCNR'] as any },
      },
    });
    if (!account) throw new NotFoundError('NRI Account');
    return account;
  }

  async updateNriDetails(accountId: string, userId: string, data: {
    nomineeName?: string;
    nomineeRelation?: string;
    overseasAddress?: string;
  }) {
    const db = getPersonalDb();
    const account = await db.personalAccount.findFirst({
      where: {
        id: accountId,
        userId,
        accountType: { in: ['NRE', 'NRO', 'FCNR'] as any },
      },
    });
    if (!account) throw new NotFoundError('NRI Account');

    return db.personalAccount.update({
      where: { id: accountId },
      data: {
        ...(data.nomineeName && { nomineeName: data.nomineeName }),
        ...(data.nomineeRelation && { nomineeRelation: data.nomineeRelation }),
      },
    });
  }
}

export const nriAccountService = new NriAccountService();
