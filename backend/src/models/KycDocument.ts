export enum KycType {
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  VOTER_ID = 'voter_id',
  COMPANY_REGISTRATION = 'company_registration',
  GST_CERTIFICATE = 'gst_certificate',
}

export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IKycDocument {
  id: string;
  userId: string;
  kycType: KycType;
  documentNumber: string;
  frontImage: string;
  backImage?: string;
  selfieImage?: string;
  status: KycStatus;
  remarks?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  isCompanyDocument: boolean;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}
