import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth';
import { transferLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.post('/transfer', transferLimiter, transactionController.transfer.bind(transactionController));
router.get('/history', transactionController.getHistory.bind(transactionController));
router.post('/upi/pay', transferLimiter, transactionController.upiPayment.bind(transactionController));
router.get('/upi/history', transactionController.getUpiHistory.bind(transactionController));

export default router;
