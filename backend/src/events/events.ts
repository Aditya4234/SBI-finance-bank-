export const DomainEvents = {
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged-in',
  USER_LOGGED_OUT: 'user.logged-out',
  USER_VERIFIED: 'user.verified',
  PASSWORD_CHANGED: 'password.changed',
  TRANSACTION_CREATED: 'transaction.created',
  TRANSACTION_COMPLETED: 'transaction.completed',
  TRANSACTION_FAILED: 'transaction.failed',
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_CLOSED: 'account.closed',
  LOAN_APPLIED: 'loan.applied',
  LOAN_APPROVED: 'loan.approved',
  LOAN_REJECTED: 'loan.rejected',
  LOAN_DISBURSED: 'loan.disbursed',
  CARD_ISSUED: 'card.issued',
  CARD_BLOCKED: 'card.blocked',
  CARD_UNBLOCKED: 'card.unblocked',
  KYC_SUBMITTED: 'kyc.submitted',
  KYC_APPROVED: 'kyc.approved',
  KYC_REJECTED: 'kyc.rejected',
  BILL_PAID: 'bill.paid',
  CHEQUE_STOPPED: 'cheque.stopped',
  FIXED_DEPOSIT_CREATED: 'fixed-deposit.created',
  RECURRING_DEPOSIT_CREATED: 'recurring-deposit.created',
  NOTIFICATION_SENT: 'notification.sent',
  CORPORATE_TRANSACTION_CREATED: 'corporate.transaction.created',
  COMPANY_CREATED: 'company.created',
} as const;

export type DomainEvent = (typeof DomainEvents)[keyof typeof DomainEvents];

export interface DomainEventPayload {
  eventId: string;
  eventName: DomainEvent;
  correlationId?: string;
  timestamp: Date;
  data: Record<string, any>;
}
