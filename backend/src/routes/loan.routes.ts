import { Router } from 'express';
import { loanController } from '../controllers/loan.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/apply', loanController.applyLoan.bind(loanController));
router.get('/', loanController.getUserLoans.bind(loanController));
router.get('/:loanId', loanController.getLoanStatus.bind(loanController));
router.post('/calculate-emi', loanController.calculateEmi.bind(loanController));

export default router;
