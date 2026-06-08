import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const deviceTracking = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const deviceId = req.headers['x-device-id'] as string;
  const deviceName = req.headers['x-device-name'] as string;

  req.deviceId = deviceId || 'unknown';
  req.deviceName = deviceName || 'unknown';
  req.ipAddress = req.ip || req.socket.remoteAddress;

  next();
};
