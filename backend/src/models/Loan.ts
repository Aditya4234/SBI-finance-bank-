import { LoanDocument, Guarantor, Collateral } from '../types';

export enum LoanType {
  PERSONAL = 'personal',
  HOME = 'home',
  CAR = 'car',
  EDUCATION = 'education',
  BUSINESS = 'business',
  GOLD = 'gold',
  MORTGAGE = 'mortgage',
  OVERDRAFT = 'overdraft',
}

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
  CLOSED = 'closed',
  DEFAULTED = 'defaulted',
}

export interface ILoan {
  id: string;
  userId: string;
  loanType: LoanType;
  amount: number;
  tenure: number;
  interestRate: number;
  status: LoanStatus;
  purpose?: string;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  amountPaid: number;
  emiRemaining: number;
  disbursedDate?: Date;
  closureDate?: Date;
  documents?: LoanDocument[];
  guarantor?: Guarantor;
  collateral?: Collateral;
  approvedBy?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}
