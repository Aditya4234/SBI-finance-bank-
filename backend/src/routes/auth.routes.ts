import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, authController.register.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/forgot-password', authLimiter, authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.get('/verify-email', authController.verifyEmail.bind(authController));
router.post('/send-otp', authLimiter, authController.sendOtp.bind(authController));
router.post('/verify-otp', authController.verifyOtp.bind(authController));
router.post('/2fa/enable', authenticate, authController.enable2fa.bind(authController));
router.post('/2fa/verify', authenticate, authController.verify2fa.bind(authController));

export default router;
