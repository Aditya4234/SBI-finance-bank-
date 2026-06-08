import { Response, NextFunction } from 'express';
import { chequeService } from '../services/cheque.service';
import { AuthenticatedRequest } from '../types';

export class ChequeController {
  async requestBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId, leafCount, branchName } = req.body;
      const book = await chequeService.requestChequeBook(req.user!.userId, { accountId, leafCount, branchName });
      res.status(201).json({ success: true, message: 'Cheque book requested successfully', data: book });
    } catch (error) {
      next(error);
    }
  }

  async getBooks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const books = await chequeService.getChequeBooks(req.user!.userId);
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }

  async getBookById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const book = await chequeService.getChequeBookById(req.params.id, req.user!.userId);
      res.json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  }

  async stopCheque(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const leaf = await chequeService.stopCheque(req.params.leafId, req.user!.userId, reason);
      res.json({ success: true, message: 'Cheque stop request processed', data: leaf });
    } catch (error) {
      next(error);
    }
  }

  async stopChequeByNumber(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountNumber, leafNumber, reason } = req.body;
      const leaf = await chequeService.stopChequeByNumber(accountNumber, leafNumber, req.user!.userId, reason);
      res.json({ success: true, message: 'Cheque stop request processed', data: leaf });
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const leafNumber = parseInt(req.params.leafNumber);
      const status = await chequeService.getChequeStatus(leafNumber, req.params.accountNumber);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  async getBooksByAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const books = await chequeService.getChequeBooksByAccount(req.params.accountId, req.user!.userId);
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }
}

export const chequeController = new ChequeController();
