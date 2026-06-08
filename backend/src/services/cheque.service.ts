import { AppError, NotFoundError } from '../utils/errors';
import { getPersonalDb } from '../config/personal-db';
import { v4 as uuidv4 } from 'uuid';

interface ChequeBookRequestData {
  accountId: string;
  leafCount?: number;
  branchName: string;
}

export class ChequeService {
  async requestChequeBook(userId: string, data: ChequeBookRequestData) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: { id: data.accountId, userId, status: { not: 'CLOSED' as any } },
    });
    if (!account) throw new NotFoundError('Account');

    const leafCount = data.leafCount || 25;
    const bookNumber = `SBICQ${uuidv4().substring(0, 10).toUpperCase()}`;

    const lastBook = await db.chequeBook.findFirst({
      where: { accountId: data.accountId },
      orderBy: { endLeaf: 'desc' },
    });
    const startLeaf = lastBook ? lastBook.endLeaf + 1 : 1;
    const endLeaf = startLeaf + leafCount - 1;

    const book = await db.chequeBook.create({
      data: {
        userId,
        accountId: data.accountId,
        bookNumber,
        leafCount,
        startLeaf,
        endLeaf,
        status: 'REQUESTED',
        branchName: data.branchName,
      },
    });

    const leaves = Array.from({ length: leafCount }, (_, i) => ({
      chequeBookId: book.id,
      leafNumber: startLeaf + i,
    }));

    await db.chequeLeaf.createMany({ data: leaves });

    return db.chequeBook.findUnique({
      where: { id: book.id },
      include: { chequeLeaves: { orderBy: { leafNumber: 'asc' } } },
    });
  }

  async getChequeBooks(userId: string) {
    const db = getPersonalDb();
    return db.chequeBook.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { chequeLeaves: true } } },
    });
  }

  async getChequeBookById(bookId: string, userId: string) {
    const db = getPersonalDb();
    const book = await db.chequeBook.findFirst({
      where: { id: bookId, userId },
      include: { chequeLeaves: { orderBy: { leafNumber: 'asc' } } },
    });
    if (!book) throw new NotFoundError('Cheque book');
    return book;
  }

  async stopCheque(leafId: string, userId: string, reason?: string) {
    const db = getPersonalDb();
    const leaf = await db.chequeLeaf.findUnique({
      where: { id: leafId },
      include: { chequeBook: true },
    });
    if (!leaf) throw new NotFoundError('Cheque leaf');
    if (leaf.chequeBook.userId !== userId) throw new AppError('Unauthorized access', 403);
    if (leaf.status === 'STOPPED') throw new AppError('Cheque already stopped', 400);

    return db.chequeLeaf.update({
      where: { id: leafId },
      data: { status: 'STOPPED', stopDate: new Date(), stopReason: reason || null },
    });
  }

  async stopChequeByNumber(accountNumber: string, leafNumber: number, userId: string, reason?: string) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: { accountNumber, userId },
    });
    if (!account) throw new NotFoundError('Account');

    const book = await db.chequeBook.findFirst({
      where: { accountId: account.id, startLeaf: { lte: leafNumber }, endLeaf: { gte: leafNumber } },
    });
    if (!book) throw new NotFoundError('Cheque book for this leaf number');

    const leaf = await db.chequeLeaf.findFirst({
      where: { chequeBookId: book.id, leafNumber },
    });
    if (!leaf) throw new NotFoundError('Cheque leaf');
    if (leaf.status === 'STOPPED') throw new AppError('Cheque already stopped', 400);

    return db.chequeLeaf.update({
      where: { id: leaf.id },
      data: { status: 'STOPPED', stopDate: new Date(), stopReason: reason || null },
    });
  }

  async getChequeStatus(leafNumber: number, accountNumber: string) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findUnique({ where: { accountNumber } });
    if (!account) throw new NotFoundError('Account');

    const book = await db.chequeBook.findFirst({
      where: { accountId: account.id, startLeaf: { lte: leafNumber }, endLeaf: { gte: leafNumber } },
    });
    if (!book) throw new NotFoundError('Cheque book for this leaf number');

    const leaf = await db.chequeLeaf.findFirst({
      where: { chequeBookId: book.id, leafNumber },
    });
    if (!leaf) throw new NotFoundError('Cheque leaf');

    return {
      leafNumber: leaf.leafNumber,
      status: leaf.status,
      issuedTo: leaf.issuedTo,
      issuedDate: leaf.issuedDate,
      amount: leaf.amount,
      stopDate: leaf.stopDate,
      stopReason: leaf.stopReason,
      clearedDate: leaf.clearedDate,
      bookNumber: book.bookNumber,
      accountNumber: account.accountNumber,
    };
  }

  async getChequeBooksByAccount(accountId: string, userId: string) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({ where: { id: accountId, userId } });
    if (!account) throw new NotFoundError('Account');

    return db.chequeBook.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { chequeLeaves: true } } },
    });
  }
}

export const chequeService = new ChequeService();
