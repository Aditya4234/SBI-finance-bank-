export enum NotificationType {
  TRANSACTION = 'transaction',
  KYC = 'kyc',
  LOAN = 'loan',
  ACCOUNT = 'account',
  SECURITY = 'security',
  PROMOTIONAL = 'promotional',
  SYSTEM = 'system',
}

export interface INotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
}
