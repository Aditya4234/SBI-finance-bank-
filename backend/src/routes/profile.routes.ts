import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile.bind(profileController));
router.put('/', profileController.updateProfile.bind(profileController));
router.put('/change-password', profileController.changePassword.bind(profileController));
router.put('/profile-image', profileController.updateProfileImage.bind(profileController));

export default router;
