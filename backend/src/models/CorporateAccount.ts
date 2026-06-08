export enum CorporateAccountType {
  CURRENT = 'corporate_current',
  BUSINESS = 'business',
  ESCROW = 'escrow',
}

export interface ICorporateAccount {
  id: string;
  companyId: string;
  accountNumber: string;
  ifscCode: string;
  accountType: CorporateAccountType;
  balance: number;
  status: string;
  branchName: string;
  branchCode: string;
  openingDate: Date;
  monthlyStatement: boolean;
  corporateUpiEnabled: boolean;
  dailyTransactionLimit: number;
  monthlyTransactionLimit: number;
  createdAt: Date;
  updatedAt: Date;
}
