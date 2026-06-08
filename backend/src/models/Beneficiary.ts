export interface IBeneficiary {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  isVerified: boolean;
  transferLimit: number;
  nickname?: string;
  email?: string;
  mobile?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
