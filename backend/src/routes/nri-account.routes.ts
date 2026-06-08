import { Router } from 'express';
import { nriAccountController } from '../controllers/nri-account.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/open', nriAccountController.openNriAccount.bind(nriAccountController));
router.get('/', nriAccountController.getNriAccounts.bind(nriAccountController));
router.get('/:accountId', nriAccountController.getNriAccountDetails.bind(nriAccountController));
router.put('/:accountId', nriAccountController.updateNriDetails.bind(nriAccountController));

export default router;
