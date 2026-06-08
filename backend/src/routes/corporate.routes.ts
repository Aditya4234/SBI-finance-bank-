import { Router } from 'express';
import { corporateController } from '../controllers/corporate.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.post('/create-company', authorize(UserRole.PERSONAL_CUSTOMER), corporateController.createCompany.bind(corporateController));
router.get('/company', authorize(UserRole.CORPORATE_ADMIN, UserRole.FINANCE_MANAGER, UserRole.EMPLOYEE), corporateController.getCompany.bind(corporateController));
router.post('/add-employee', authorize(UserRole.CORPORATE_ADMIN), corporateController.addEmployee.bind(corporateController));
router.post('/open-account', authorize(UserRole.CORPORATE_ADMIN), corporateController.openAccount.bind(corporateController));
router.get('/accounts', authorize(UserRole.CORPORATE_ADMIN, UserRole.FINANCE_MANAGER), corporateController.getAccounts.bind(corporateController));
router.post('/bulk-payment', authorize(UserRole.CORPORATE_ADMIN, UserRole.FINANCE_MANAGER), corporateController.bulkPayment.bind(corporateController));
router.get('/transactions', authorize(UserRole.CORPORATE_ADMIN, UserRole.FINANCE_MANAGER), corporateController.getTransactions.bind(corporateController));

export default router;
