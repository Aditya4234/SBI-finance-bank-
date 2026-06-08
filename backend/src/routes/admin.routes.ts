import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN, UserRole.BANK_ADMIN));

router.get('/dashboard', adminController.getDashboard.bind(adminController));
router.get('/revenue', adminController.getRevenueAnalytics.bind(adminController));
router.get('/fraud', adminController.getFraudAnalytics.bind(adminController));
router.get('/customers', adminController.getCustomers.bind(adminController));
router.get('/kyc/pending', adminController.getPendingKyc.bind(adminController));
router.post('/kyc/:documentId/approve', adminController.approveKyc.bind(adminController));
router.post('/kyc/:documentId/reject', adminController.rejectKyc.bind(adminController));
router.get('/loans', adminController.getLoans.bind(adminController));
router.post('/loans/:loanId/approve', adminController.approveLoan.bind(adminController));
router.post('/loans/disburse', adminController.disburseLoan.bind(adminController));
router.post('/loans/:loanId/reject', adminController.rejectLoan.bind(adminController));
router.post('/accounts/:type/:accountId/freeze', adminController.freezeAccount.bind(adminController));
router.post('/accounts/:type/:accountId/unfreeze', adminController.unfreezeAccount.bind(adminController));
router.get('/reports/:type', adminController.generateReport.bind(adminController));

export default router;
