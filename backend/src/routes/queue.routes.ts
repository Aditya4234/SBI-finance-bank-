import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN, UserRole.BANK_ADMIN));

router.get('/metrics', queueController.getMetrics.bind(queueController));
router.post('/emi-collection', queueController.triggerEmiCollection.bind(queueController));
router.post('/default-check', queueController.triggerDefaultCheck.bind(queueController));
router.post('/retry-failed', queueController.retryFailedJobs.bind(queueController));

export default router;
