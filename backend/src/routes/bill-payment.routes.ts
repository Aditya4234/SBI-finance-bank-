import { Router } from 'express';
import { billPaymentController } from '../controllers/bill-payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/pay', billPaymentController.payBill.bind(billPaymentController));
router.post('/recharge', billPaymentController.recharge.bind(billPaymentController));
router.get('/', billPaymentController.getHistory.bind(billPaymentController));
router.get('/pending', billPaymentController.getPendingBills.bind(billPaymentController));
router.get('/:id', billPaymentController.getById.bind(billPaymentController));
router.post('/schedule', billPaymentController.scheduleBill.bind(billPaymentController));

export default router;
