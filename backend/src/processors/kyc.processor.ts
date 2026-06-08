import { Job } from 'bull';
import { kycQueue, emailQueue, notificationQueue } from '../queues';
import { KycJobData } from '../queues/jobTypes';
import { logger } from '../config/logger';
import { getPersonalDb } from '../config/personal-db';

export const processKycQueue = async () => {
  kycQueue.process(async (job: Job<KycJobData>) => {
    const { type, userId, documentId } = job.data;
    logger.info(`Processing KYC job ${job.id}: ${type}`);

    switch (type) {
      case 'verify-document':
        return verifyDocument(documentId, userId);
      case 'check-status':
        return checkKycStatus(userId);
      case 'expiry-reminder':
        return sendExpiryReminders();
      default:
        throw new Error(`Unknown KYC type: ${type}`);
    }
  });
};

async function verifyDocument(documentId?: string, _userId?: string) {
  if (!documentId) throw new Error('Document ID required');

  const db = getPersonalDb();
  const doc = await db.kycDocument.findUnique({
    where: { id: documentId },
    include: { user: { select: { fullName: true, email: true } } },
  });
  if (!doc) throw new Error('Document not found');

  const allDocs = await db.kycDocument.findMany({
    where: { userId: doc.userId, status: 'APPROVED' as any },
  });
  if (allDocs.length >= 2) {
    await db.user.update({
      where: { id: doc.userId },
      data: { isKycCompleted: true },
    });
  }

  return doc;
}

async function checkKycStatus(userId: string) {
  const db = getPersonalDb();
  const docs = await db.kycDocument.findMany({ where: { userId } });
  const pending = docs.filter(d => d.status === 'PENDING');
  const approved = docs.filter(d => d.status === 'APPROVED');
  const rejected = docs.filter(d => d.status === 'REJECTED');

  return { total: docs.length, pending: pending.length, approved: approved.length, rejected: rejected.length };
}

async function sendExpiryReminders() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const db = getPersonalDb();
  const expiringDocs = await db.kycDocument.findMany({
    where: {
      expiresAt: { lte: thirtyDaysFromNow, gte: new Date() },
      status: 'APPROVED' as any,
    },
    include: { user: { select: { email: true, fullName: true } } },
  });

  for (const doc of expiringDocs) {
    await emailQueue.add({
      type: 'kyc-status',
      to: doc.user.email,
      payload: {
        status: 'expiring',
        name: doc.user.fullName,
        documentType: doc.kycType,
        expiryDate: doc.expiresAt,
      },
    });
  }

  return { remindersSent: expiringDocs.length };
}
