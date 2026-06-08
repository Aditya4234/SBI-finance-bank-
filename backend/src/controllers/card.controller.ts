import { Response, NextFunction } from 'express';
import { cardService } from '../services/card.service';
import { AuthenticatedRequest } from '../types';

export class CardController {
  async issueDebitCard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountId, cardNetwork } = req.body;
      const card = await cardService.issueDebitCard(req.user!.userId, accountId, cardNetwork);
      res.status(201).json({ success: true, message: 'Debit card issued successfully', data: card });
    } catch (error) {
      next(error);
    }
  }

  async issueCreditCard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const card = await cardService.issueCreditCard(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Credit card issued successfully', data: card });
    } catch (error) {
      next(error);
    }
  }

  async getCards(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cards = await cardService.getUserCards(req.user!.userId);
      res.json({ success: true, data: cards });
    } catch (error) {
      next(error);
    }
  }

  async getCard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const card = await cardService.getCardById(cardId, req.user!.userId);
      res.json({ success: true, data: card });
    } catch (error) {
      next(error);
    }
  }

  async blockCard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const { reason } = req.body;
      const card = await cardService.blockCard(cardId, req.user!.userId, reason);
      res.json({ success: true, message: 'Card blocked successfully', data: card });
    } catch (error) {
      next(error);
    }
  }

  async unblockCard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const card = await cardService.unblockCard(cardId, req.user!.userId);
      res.json({ success: true, message: 'Card unblocked successfully', data: card });
    } catch (error) {
      next(error);
    }
  }

  async setCardLimits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const card = await cardService.setCardLimit(cardId, req.user!.userId, req.body);
      res.json({ success: true, message: 'Card limits updated successfully', data: card });
    } catch (error) {
      next(error);
    }
  }

  async toggleInternational(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const card = await cardService.toggleInternational(cardId, req.user!.userId);
      res.json({ success: true, message: 'International usage toggled successfully', data: card });
    } catch (error) {
      next(error);
    }
  }

  async toggleContactless(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const card = await cardService.toggleContactless(cardId, req.user!.userId);
      res.json({ success: true, message: 'Contactless payment toggled successfully', data: card });
    } catch (error) {
      next(error);
    }
  }

  async setPin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const card = await cardService.setPin(cardId, req.user!.userId);
      res.json({ success: true, message: 'PIN set successfully', data: card });
    } catch (error) {
      next(error);
    }
  }

  async cancelCard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { cardId } = req.params;
      const card = await cardService.cancelCard(cardId, req.user!.userId);
      res.json({ success: true, message: 'Card cancelled successfully', data: card });
    } catch (error) {
      next(error);
    }
  }
}

export const cardController = new CardController();
