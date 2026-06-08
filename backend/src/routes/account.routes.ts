import { Router } from 'express';
import { accountController } from '../controllers/account.controller';
import { authenticate } from '../middleware/auth';
import { transferLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);

router.get('/', accountController.getAccounts.bind(accountController));
router.post('/open', transferLimiter, accountController.openAccount.bind(accountController));
router.get('/:accountId/balance', accountController.getBalance.bind(accountController));
router.get('/:accountId/statement', accountController.getMiniStatement.bind(accountController));
router.get('/:accountId/transactions', accountController.getTransactionHistory.bind(accountController));
router.post('/:accountId/close', accountController.closeAccount.bind(accountController));
router.get('/closed/all', accountController.getClosedAccounts.bind(accountController));

export default router;
