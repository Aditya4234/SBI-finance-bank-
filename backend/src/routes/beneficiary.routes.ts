import { Router } from 'express';
import { beneficiaryController } from '../controllers/beneficiary.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', beneficiaryController.getBeneficiaries.bind(beneficiaryController));
router.post('/', beneficiaryController.addBeneficiary.bind(beneficiaryController));
router.put('/:id', beneficiaryController.updateBeneficiary.bind(beneficiaryController));
router.delete('/:id', beneficiaryController.deleteBeneficiary.bind(beneficiaryController));

export default router;
