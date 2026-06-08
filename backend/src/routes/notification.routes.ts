import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications.bind(notificationController));
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));
router.put('/read-all', notificationController.markAllAsRead.bind(notificationController));
router.put('/:notificationId/read', notificationController.markAsRead.bind(notificationController));
router.delete('/:notificationId', notificationController.deleteNotification.bind(notificationController));
router.delete('/', notificationController.clearAll.bind(notificationController));

export default router;
