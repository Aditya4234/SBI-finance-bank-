import { AppError, NotFoundError } from '../utils/errors';
import { getPersonalDb } from '../config/personal-db';

interface CreateSIData {
  fromAccount: string;
  toAccount: string;
  toIfsc?: string;
  toName: string;
  amount: number;
  frequency: string;
  startDate: string;
  endDate?: string;
  description?: string;
  maxOccurrences?: number;
}

export class StandingInstructionService {
  private calculateNextExecution(startDate: Date, frequency: string): Date {
    const next = new Date(startDate);
    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  async createInstruction(userId: string, data: CreateSIData) {
    const db = getPersonalDb();

    const account = await db.personalAccount.findFirst({
      where: { accountNumber: data.fromAccount, userId, status: { not: 'CLOSED' as any } },
    });
    if (!account) throw new NotFoundError('Source account');

    const startDate = new Date(data.startDate);
    const nextExecution = startDate > new Date() ? startDate : this.calculateNextExecution(startDate, data.frequency);

    return db.standingInstruction.create({
      data: {
        userId,
        fromAccount: data.fromAccount,
        toAccount: data.toAccount,
        toIfsc: data.toIfsc,
        toName: data.toName,
        amount: data.amount,
        frequency: data.frequency,
        startDate,
        endDate: data.endDate ? new Date(data.endDate) : null,
        nextExecution,
        description: data.description,
        maxOccurrences: data.maxOccurrences,
      },
    });
  }

  async getUserInstructions(userId: string) {
    const db = getPersonalDb();
    return db.standingInstruction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async getInstructionById(id: string, userId: string) {
    const db = getPersonalDb();
    const si = await db.standingInstruction.findFirst({ where: { id, userId } });
    if (!si) throw new NotFoundError('Standing Instruction');
    return si;
  }

  async updateInstruction(id: string, userId: string, data: Partial<CreateSIData>) {
    const db = getPersonalDb();
    const si = await db.standingInstruction.findFirst({ where: { id, userId } });
    if (!si) throw new NotFoundError('Standing Instruction');
    if (si.status !== 'ACTIVE') throw new AppError('Only active instructions can be updated', 400);

    return db.standingInstruction.update({
      where: { id },
      data: {
        ...(data.toAccount && { toAccount: data.toAccount }),
        ...(data.toIfsc && { toIfsc: data.toIfsc }),
        ...(data.toName && { toName: data.toName }),
        ...(data.amount && { amount: data.amount }),
        ...(data.frequency && { frequency: data.frequency }),
        ...(data.description && { description: data.description }),
        ...(data.maxOccurrences && { maxOccurrences: data.maxOccurrences }),
      },
    });
  }

  async cancelInstruction(id: string, userId: string) {
    const db = getPersonalDb();
    const si = await db.standingInstruction.findFirst({ where: { id, userId } });
    if (!si) throw new NotFoundError('Standing Instruction');

    return db.standingInstruction.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async pauseInstruction(id: string, userId: string) {
    const db = getPersonalDb();
    const si = await db.standingInstruction.findFirst({ where: { id, userId } });
    if (!si) throw new NotFoundError('Standing Instruction');
    if (si.status !== 'ACTIVE') throw new AppError('Only active instructions can be paused', 400);

    return db.standingInstruction.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
  }

  async resumeInstruction(id: string, userId: string) {
    const db = getPersonalDb();
    const si = await db.standingInstruction.findFirst({ where: { id, userId } });
    if (!si) throw new NotFoundError('Standing Instruction');
    if (si.status !== 'PAUSED') throw new AppError('Only paused instructions can be resumed', 400);

    const nextExecution = this.calculateNextExecution(new Date(), si.frequency);

    return db.standingInstruction.update({
      where: { id },
      data: { status: 'ACTIVE', nextExecution },
    });
  }
}

export const standingInstructionService = new StandingInstructionService();
