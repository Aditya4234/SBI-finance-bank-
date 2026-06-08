import { Router } from 'express';
import { serviceRequestController } from '../controllers/service-request.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/all', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.BANK_ADMIN), serviceRequestController.getAllRequests.bind(serviceRequestController));
router.put('/:id/status', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.BANK_ADMIN), serviceRequestController.updateRequestStatus.bind(serviceRequestController));

router.use(authenticate);

router.get('/', serviceRequestController.getUserRequests.bind(serviceRequestController));
router.post('/', serviceRequestController.createRequest.bind(serviceRequestController));
router.get('/:id', serviceRequestController.getRequest.bind(serviceRequestController));

export default router;
