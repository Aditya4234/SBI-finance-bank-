import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types';
import { config } from '../config';

function setCorsHeaders(req: Request, res: Response) {
  const origin = req.headers.origin;
  if (origin && (config.corsOrigins.includes(origin) || config.nodeEnv === 'development')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', config.corsAllowedMethods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', config.corsAllowedHeaders.join(', '));
    res.setHeader('Access-Control-Expose-Headers', config.corsExposedHeaders.join(', '));
  }
}

export const errorHandler = (err: Error, req: Request, res: Response<ApiResponse>, _next: NextFunction) => {
  setCorsHeaders(req, res);
  logger.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate value for unique field',
      });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  setCorsHeaders(req, res);
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};
