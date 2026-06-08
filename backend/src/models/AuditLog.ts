export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  TRANSACTION = 'transaction',
  ACCOUNT_OPEN = 'account_open',
  ACCOUNT_CLOSE = 'account_close',
  KYC_SUBMIT = 'kyc_submit',
  KYC_APPROVE = 'kyc_approve',
  LOAN_APPLY = 'loan_apply',
  LOAN_APPROVE = 'loan_approve',
  PASSWORD_CHANGE = 'password_change',
  PROFILE_UPDATE = 'profile_update',
  BENEFICIARY_ADD = 'beneficiary_add',
  BENEFICIARY_REMOVE = 'beneficiary_remove',
  CARD_BLOCK = 'card_block',
  CARD_UNBLOCK = 'card_unblock',
  BULK_PAYMENT = 'bulk_payment',
  ROLE_CHANGE = 'role_change',
  FREEZE_ACCOUNT = 'freeze_account',
  UNFREEZE_ACCOUNT = 'unfreeze_account',
  SETTINGS_CHANGE = 'settings_change',
}

export interface IAuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  status: 'success' | 'failure';
  metadata?: Record<string, any>;
  createdAt: Date;
}
