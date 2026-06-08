import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/', auditController.getMyLogs.bind(auditController));
router.get('/all', authorize(UserRole.SUPER_ADMIN, UserRole.BANK_ADMIN), auditController.getAllLogs.bind(auditController));

export default router;
