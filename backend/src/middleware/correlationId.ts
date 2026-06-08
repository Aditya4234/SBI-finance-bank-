import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { appContext, AppContextData } from '../context/app-context';

export const correlationId = (req: Request, _res: Response, next: NextFunction) => {
  const cid = (req.headers['x-correlation-id'] as string) || uuidv4();

  _res.setHeader('x-correlation-id', cid);

  const ctx: AppContextData = {
    correlationId: cid,
    ipAddress: req.ip,
    deviceId: (req.headers['x-device-id'] as string),
    requestPath: req.path,
    requestMethod: req.method,
    startTime: Date.now(),
  };

  appContext.run(ctx, () => {
    next();
  });
};
