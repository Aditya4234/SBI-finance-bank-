export interface EmailJobData {
  type: 'welcome' | 'verification' | 'password-reset' | 'transaction-alert' | 'otp' | 'kyc-status' | 'loan-status' | 'promotional';
  to: string;
  subject?: string;
  payload: Record<string, any>;
}

export interface TransactionJobData {
  type: 'process-transfer' | 'process-bulk-payment' | 'process-salary' | 'process-upi';
  data: Record<string, any>;
  userId?: string;
  companyId?: string;
}

export interface AuditJobData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
}

export interface NotificationJobData {
  userId: string;
  type: 'transaction' | 'kyc' | 'loan' | 'account' | 'security' | 'promotional' | 'system';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface ReportJobData {
  type: 'customers' | 'transactions' | 'loans' | 'kyc';
  requestedBy: string;
  format: 'csv' | 'pdf' | 'excel';
  filters?: Record<string, any>;
}

export interface KycJobData {
  type: 'verify-document' | 'check-status' | 'expiry-reminder';
  userId: string;
  documentId?: string;
}

export interface LoanJobData {
  type: 'process-application' | 'approve' | 'disburse' | 'emi-collection' | 'default-check';
  loanId?: string;
  userId?: string;
  data?: Record<string, any>;
}

export type JobData =
  | { queue: 'email'; data: EmailJobData }
  | { queue: 'transactions'; data: TransactionJobData }
  | { queue: 'audit'; data: AuditJobData }
  | { queue: 'notifications'; data: NotificationJobData }
  | { queue: 'reports'; data: ReportJobData }
  | { queue: 'kyc'; data: KycJobData }
  | { queue: 'loans'; data: LoanJobData };
