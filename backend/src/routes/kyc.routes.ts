import { Router } from 'express';
import { kycController } from '../controllers/kyc.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/my-documents', kycController.getMyDocuments.bind(kycController));
router.post('/upload', kycController.uploadDocument.bind(kycController));

export default router;
