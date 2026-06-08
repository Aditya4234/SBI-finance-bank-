export enum TransactionType {
  NEFT = 'neft',
  RTGS = 'rtgs',
  IMPS = 'imps',
  UPI = 'upi',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  BULK_PAYMENT = 'bulk_payment',
  SALARY = 'salary',
  VENDOR = 'vendor',
  GST = 'gst',
  TAX = 'tax',
  INTEREST = 'interest',
  FEE = 'fee',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export interface ITransaction {
  id: string;
  transactionId: string;
  userId?: string;
  companyId?: string;
  fromAccount: string;
  toAccount: string;
  toIfsc?: string;
  toName: string;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  description?: string;
  reference?: string;
  beneficiaryId?: string;
  isInternal: boolean;
  fee: number;
  balanceBefore?: number;
  balanceAfter?: number;
  paymentDate: Date;
  processedDate?: Date;
  approvedBy?: string;
  approvalStatus?: string;
  ipAddress?: string;
  deviceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
