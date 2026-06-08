import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { profileService } from '../services/profile.service';

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profileService.getProfile(req.user!.userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { fullName, mobile, profileImage } = req.body;
      const profile = await profileService.updateProfile(req.user!.userId, { fullName, mobile, profileImage });
      res.json({ success: true, message: 'Profile updated', data: profile });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await profileService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateProfileImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { imageUrl } = req.body;
      const profile = await profileService.updateProfileImage(req.user!.userId, imageUrl);
      res.json({ success: true, message: 'Profile image updated', data: profile });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
