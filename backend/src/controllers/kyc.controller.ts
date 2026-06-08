import { Response, NextFunction } from 'express';
import { kycService } from '../services/kyc.service';
import { AuthenticatedRequest } from '../types';

export class KycController {
  async getMyDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const documents = await kycService.getMyDocuments(req.user!.userId);
      res.json({ success: true, data: documents });
    } catch (error) {
      next(error);
    }
  }

  async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { kycType, documentNumber, frontImage, backImage, selfieImage } = req.body;
      const doc = await kycService.uploadDocument(req.user!.userId, {
        kycType,
        documentNumber,
        frontImage,
        backImage,
        selfieImage,
      });
      res.status(201).json({ success: true, message: 'KYC document uploaded successfully', data: doc });
    } catch (error) {
      next(error);
    }
  }
}

export const kycController = new KycController();
