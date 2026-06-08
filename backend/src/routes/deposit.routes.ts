import { Router } from 'express';
import { depositController } from '../controllers/deposit.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/fixed', depositController.getFixedDeposits.bind(depositController));
router.post('/fixed/open', depositController.openFixedDeposit.bind(depositController));
router.get('/fixed/:id', depositController.getFixedDeposit.bind(depositController));
router.post('/fixed/:id/close', depositController.closeFixedDeposit.bind(depositController));
router.get('/recurring', depositController.getRecurringDeposits.bind(depositController));
router.post('/recurring/open', depositController.openRecurringDeposit.bind(depositController));
router.get('/recurring/:id', depositController.getRecurringDeposit.bind(depositController));
router.post('/recurring/:id/pay', depositController.makeRdPayment.bind(depositController));
router.post('/recurring/:id/close', depositController.closeRecurringDeposit.bind(depositController));

export default router;
