import { getPersonalDb } from '../config/personal-db';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class NotificationService {
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const db = getPersonalDb();
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string) {
    const db = getPersonalDb();
    return db.notification.count({ where: { userId, isRead: false } });
  }

  async markAsRead(notificationId: string, userId: string) {
    const db = getPersonalDb();
    const notification = await db.notification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new NotFoundError('Notification');
    if (notification.userId !== userId) throw new ForbiddenError('You can only mark your own notifications as read');

    return db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const db = getPersonalDb();
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const db = getPersonalDb();
    const notification = await db.notification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new NotFoundError('Notification');
    if (notification.userId !== userId) throw new ForbiddenError('You can only delete your own notifications');

    await db.notification.delete({ where: { id: notificationId } });
  }

  async clearAll(userId: string) {
    const db = getPersonalDb();
    await db.notification.deleteMany({ where: { userId } });
  }
}

export const notificationService = new NotificationService();
