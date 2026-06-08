import { getPersonalDb } from '../config/personal-db';
import { AppError, ValidationError } from '../utils/errors';

const VALID_KYC_TYPES = ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID', 'COMPANY_REGISTRATION', 'GST_CERTIFICATE'];

export class KycService {
  async getMyDocuments(userId: string) {
    const db = getPersonalDb();
    return db.kycDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async uploadDocument(
    userId: string,
    data: {
      kycType: string;
      documentNumber: string;
      frontImage: string;
      backImage?: string;
      selfieImage?: string;
    }
  ) {
    if (!VALID_KYC_TYPES.includes(data.kycType)) {
      throw new AppError(`Invalid KYC type. Must be one of: ${VALID_KYC_TYPES.join(', ')}`, 400);
    }

    if (!data.documentNumber || !data.documentNumber.trim()) {
      throw new AppError('Document number is required', 400);
    }

    if (!data.frontImage) {
      throw new AppError('Front image is required', 400);
    }

    const db = getPersonalDb();

    const doc = await db.kycDocument.create({
      data: {
        userId,
        kycType: data.kycType as any,
        documentNumber: data.documentNumber,
        frontImage: data.frontImage,
        backImage: data.backImage,
        selfieImage: data.selfieImage,
        status: 'PENDING' as any,
      },
    });

    return doc;
  }
}

export const kycService = new KycService();
