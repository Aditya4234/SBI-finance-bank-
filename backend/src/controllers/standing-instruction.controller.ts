import { Response, NextFunction } from 'express';
import { standingInstructionService } from '../services/standing-instruction.service';
import { AuthenticatedRequest } from '../types';

export class StandingInstructionController {
  async createInstruction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const si = await standingInstructionService.createInstruction(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Standing instruction created', data: si });
    } catch (error) {
      next(error);
    }
  }

  async getInstructions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const instructions = await standingInstructionService.getUserInstructions(req.user!.userId);
      res.json({ success: true, data: instructions });
    } catch (error) {
      next(error);
    }
  }

  async getInstruction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const si = await standingInstructionService.getInstructionById(req.params.id, req.user!.userId);
      res.json({ success: true, data: si });
    } catch (error) {
      next(error);
    }
  }

  async updateInstruction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const si = await standingInstructionService.updateInstruction(req.params.id, req.user!.userId, req.body);
      res.json({ success: true, message: 'Standing instruction updated', data: si });
    } catch (error) {
      next(error);
    }
  }

  async cancelInstruction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const si = await standingInstructionService.cancelInstruction(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Standing instruction cancelled', data: si });
    } catch (error) {
      next(error);
    }
  }

  async pauseInstruction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const si = await standingInstructionService.pauseInstruction(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Standing instruction paused', data: si });
    } catch (error) {
      next(error);
    }
  }

  async resumeInstruction(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const si = await standingInstructionService.resumeInstruction(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Standing instruction resumed', data: si });
    } catch (error) {
      next(error);
    }
  }
}

export const standingInstructionController = new StandingInstructionController();
