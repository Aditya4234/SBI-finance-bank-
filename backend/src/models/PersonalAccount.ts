export enum AccountType {
  SAVINGS = 'savings',
  CURRENT = 'current',
  SALARY = 'salary',
  FIXED_DEPOSIT = 'fixed_deposit',
  RECURRING_DEPOSIT = 'recurring_deposit',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FROZEN = 'frozen',
  CLOSED = 'closed',
}

export interface IPersonalAccount {
  id: string;
  userId: string;
  accountNumber: string;
  ifscCode: string;
  accountType: AccountType;
  status: AccountStatus;
  balance: number;
  branchName: string;
  branchCode: string;
  nomineeName?: string;
  nomineeRelation?: string;
  openingDate: Date;
  closedDate?: Date;
  monthlyStatement: boolean;
  upiEnabled: boolean;
  debitCardId?: string;
  createdAt: Date;
  updatedAt: Date;
}
