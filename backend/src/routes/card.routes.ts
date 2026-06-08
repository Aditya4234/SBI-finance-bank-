import { Router } from 'express';
import { cardController } from '../controllers/card.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', cardController.getCards.bind(cardController));
router.post('/debit/issue', cardController.issueDebitCard.bind(cardController));
router.post('/credit/issue', cardController.issueCreditCard.bind(cardController));
router.get('/:cardId', cardController.getCard.bind(cardController));
router.post('/:cardId/block', cardController.blockCard.bind(cardController));
router.post('/:cardId/unblock', cardController.unblockCard.bind(cardController));
router.put('/:cardId/limits', cardController.setCardLimits.bind(cardController));
router.post('/:cardId/toggle-international', cardController.toggleInternational.bind(cardController));
router.post('/:cardId/toggle-contactless', cardController.toggleContactless.bind(cardController));
router.post('/:cardId/set-pin', cardController.setPin.bind(cardController));
router.post('/:cardId/cancel', cardController.cancelCard.bind(cardController));

export default router;
