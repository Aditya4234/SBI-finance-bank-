import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { getPersonalDb } from '../config/personal-db';

export class BeneficiaryController {
  async addBeneficiary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const db = getPersonalDb();
      const beneficiary = await db.beneficiary.create({
        data: { ...req.body, userId: req.user!.userId },
      });
      res.status(201).json({ success: true, message: 'Beneficiary added', data: beneficiary });
    } catch (error) {
      next(error);
    }
  }

  async getBeneficiaries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const db = getPersonalDb();
      const beneficiaries = await db.beneficiary.findMany({
        where: { userId: req.user!.userId, isActive: true },
      });
      res.json({ success: true, data: beneficiaries });
    } catch (error) {
      next(error);
    }
  }

  async updateBeneficiary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const db = getPersonalDb();
      const { id } = req.params;
      const beneficiary = await db.beneficiary.updateMany({
        where: { id, userId: req.user!.userId },
        data: req.body,
      });
      res.json({ success: true, data: beneficiary });
    } catch (error) {
      next(error);
    }
  }

  async deleteBeneficiary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const db = getPersonalDb();
      const { id } = req.params;
      await db.beneficiary.updateMany({
        where: { id, userId: req.user!.userId },
        data: { isActive: false },
      });
      res.json({ success: true, message: 'Beneficiary removed' });
    } catch (error) {
      next(error);
    }
  }
}

export const beneficiaryController = new BeneficiaryController();
