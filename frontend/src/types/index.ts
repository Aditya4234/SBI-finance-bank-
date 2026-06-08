export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  isVerified: boolean;
  isKycCompleted: boolean;
  twoFactorEnabled: boolean;
  profileImage?: string;
  companyId?: string;
  pan?: string;
  aadhaar?: string;
  address?: string;
  dob?: string;
  createdAt?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BANK_ADMIN = 'BANK_ADMIN',
  CORPORATE_ADMIN = 'CORPORATE_ADMIN',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  PERSONAL_CUSTOMER = 'PERSONAL_CUSTOMER',
}

export interface Account {
  _id: string;
  userId: string;
  accountNumber: string;
  ifscCode: string;
  accountType: AccountType;
  status: AccountStatus;
  balance: number;
  branchName: string;
  nomineeName?: string;
  upiEnabled: boolean;
  createdAt: string;
}

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

export interface Transaction {
  _id: string;
  transactionId: string;
  fromAccount: string;
  toAccount: string;
  toName: string;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  description?: string;
  fee: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export enum TransactionType {
  NEFT = 'neft',
  RTGS = 'rtgs',
  IMPS = 'imps',
  UPI = 'upi',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  BULK_PAYMENT = 'bulk_payment',
  SALARY = 'salary',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export interface Beneficiary {
  _id: string;
  name: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  isVerified: boolean;
  transferLimit: number;
  nickname?: string;
}

export interface Loan {
  _id: string;
  loanType: LoanType;
  amount: number;
  tenure: number;
  interestRate: number;
  status: LoanStatus;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  amountPaid: number;
  emiRemaining: number;
  createdAt: string;
}

export enum LoanType {
  PERSONAL = 'personal',
  HOME = 'home',
  CAR = 'car',
  EDUCATION = 'education',
  BUSINESS = 'business',
  GOLD = 'gold',
}

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
  CLOSED = 'closed',
}

export interface Company {
  _id: string;
  companyName: string;
  cinNumber: string;
  gstNumber: string;
  panNumber: string;
  businessType: string;
  registeredAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  authorizedSignatory: {
    name: string;
    email: string;
    mobile: string;
  };
  isVerified: boolean;
  kycStatus: string;
  adminId: string;
  employees: any[];
}

export interface Card {
  _id: string;
  userId: string;
  accountId?: string;
  cardNumber: string;
  cardType: 'debit' | 'credit';
  status: 'active' | 'blocked' | 'expired' | 'cancelled';
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  cardNetwork: 'visa' | 'mastercard';
  dailyLimit: number;
  monthlyLimit: number;
  internationalEnabled: boolean;
  contactlessEnabled: boolean;
  pinSet: boolean;
  creditLimit?: number;
  outstandingAmount?: number;
  availableCredit?: number;
  issuedDate: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalCompanies: number;
  totalDeposits: number;
  totalLoans: number;
  totalLoansAmount: number;
  pendingLoans: number;
  pendingKyc: number;
  recentTransactions: Transaction[];
}

export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
  KYC = 'KYC',
  LOAN = 'LOAN',
  ACCOUNT = 'ACCOUNT',
  SECURITY = 'SECURITY',
  PROMOTIONAL = 'PROMOTIONAL',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
