import { DomainEvents } from '../events';
import { eventBus } from '../event-bus';
import { queueService } from '../../services/queue.service';
import { logger } from '../../config/logger';

export const registerEventHandlers = () => {
  eventBus.on(DomainEvents.USER_REGISTERED, async (payload) => {
    logger.debug(`Event: ${payload.eventName}`, { correlationId: payload.correlationId });
    await queueService.sendEmail({
      type: 'welcome',
      to: payload.data.email,
      payload: { name: payload.data.fullName },
    });
  });

  eventBus.on(DomainEvents.USER_LOGGED_IN, async (payload) => {
    logger.debug(`Event: ${payload.eventName}`, { correlationId: payload.correlationId });
    await queueService.logAudit({
      userId: payload.data.userId,
      action: 'LOGIN' as any,
      resource: 'User',
      resourceId: payload.data.userId,
      details: payload.data.deviceInfo || {},
      ipAddress: payload.data.ipAddress || 'unknown',
      userAgent: payload.data.userAgent || '',
      status: 'success',
    });
  });

  eventBus.on(DomainEvents.USER_LOGGED_OUT, async (payload) => {
    logger.debug(`Event: ${payload.eventName}`, { correlationId: payload.correlationId });
    await queueService.logAudit({
      userId: payload.data.userId,
      action: 'LOGOUT' as any,
      resource: 'User',
      resourceId: payload.data.userId,
      details: {},
      ipAddress: 'system',
      userAgent: 'system',
      status: 'success',
    });
  });

  eventBus.on(DomainEvents.TRANSACTION_COMPLETED, async (payload) => {
    logger.debug(`Event: ${payload.eventName}`, { correlationId: payload.correlationId });
    const { userId, email, transaction } = payload.data;
    if (email) {
      await queueService.sendEmail({
        type: 'transaction-alert',
        to: email,
        payload: {
          type: transaction.transactionType,
          amount: transaction.amount,
          fromAccount: transaction.fromAccount,
          toAccount: transaction.toAccount,
          date: transaction.processedDate,
        },
      });
    }
    if (userId) {
      await queueService.sendNotification({
        userId,
        type: 'transaction',
        title: 'Transaction Successful',
        message: `₹${transaction.amount} ${transaction.transactionType} transaction completed`,
        metadata: { transactionId: transaction.id },
      });
    }
  });

  eventBus.on(DomainEvents.ACCOUNT_CREATED, async (payload) => {
    logger.debug(`Event: ${payload.eventName}`, { correlationId: payload.correlationId });
    const { userId } = payload.data;
    if (userId) {
      await queueService.sendNotification({
        userId,
        type: 'account',
        title: 'Account Opened',
        message: `Your ${payload.data.accountType} account ${payload.data.accountNumber} has been opened`,
      });
    }
  });

  eventBus.on(DomainEvents.LOAN_APPLIED, async (payload) => {
    logger.debug(`Event: ${payload.eventName}`, { correlationId: payload.correlationId });
    await queueService.logAudit({
      userId: payload.data.userId,
      action: 'LOAN_APPLICATION' as any,
      resource: 'Loan',
      resourceId: payload.data.loanId,
      details: { amount: payload.data.amount, type: payload.data.loanType },
      ipAddress: 'system',
      userAgent: 'system',
      status: 'success',
    });
  });

  eventBus.on(DomainEvents.KYC_SUBMITTED, async (payload) => {
    logger.debug(`Event: ${payload.eventName}`, { correlationId: payload.correlationId });
    await queueService.processKyc({
      type: 'verify-document',
      userId: payload.data.userId,
      documentId: payload.data.documentId,
    });
  });

  logger.info('Domain event handlers registered');
};
