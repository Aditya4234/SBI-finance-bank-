import { Router } from 'express';
import { chequeController } from '../controllers/cheque.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/request', chequeController.requestBook.bind(chequeController));
router.get('/', chequeController.getBooks.bind(chequeController));
router.get('/account/:accountId', chequeController.getBooksByAccount.bind(chequeController));
router.get('/:id', chequeController.getBookById.bind(chequeController));
router.post('/stop/:leafId', chequeController.stopCheque.bind(chequeController));
router.post('/stop-by-number', chequeController.stopChequeByNumber.bind(chequeController));
router.get('/status/:leafNumber/:accountNumber', chequeController.getStatus.bind(chequeController));

export default router;
