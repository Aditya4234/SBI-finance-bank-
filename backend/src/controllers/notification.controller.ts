import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { notificationService } from '../services/notification.service';

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await notificationService.getUserNotifications(req.user!.userId, page, limit);
      res.json({
        success: true,
        message: 'Notifications fetched',
        data: result.notifications,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      res.json({ success: true, message: 'Unread count fetched', data: { unreadCount: count } });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const notification = await notificationService.markAsRead(notificationId, req.user!.userId);
      res.json({ success: true, message: 'Notification marked as read', data: notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      await notificationService.deleteNotification(notificationId, req.user!.userId);
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  }

  async clearAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.clearAll(req.user!.userId);
      res.json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
