import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { connectPersonalDb, disconnectPersonalDb } from './config/personal-db';
import { connectCorporateDb, disconnectCorporateDb } from './config/corporate-db';
import { logger } from './config/logger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { deviceTracking } from './middleware/device';
import { correlationId } from './middleware/correlationId';
import { requestLogger } from './middleware/requestLogger';
import { startAllProcessors } from './processors';
import { closeAllQueues } from './queues';
import { registerEventHandlers } from './events/handlers';

const app = express();

// --- CORS ---
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.corsOrigins.includes(origin) || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: config.corsAllowedMethods,
  allowedHeaders: config.corsAllowedHeaders,
  exposedHeaders: config.corsExposedHeaders,
  maxAge: 86400,
};

app.use(cors(corsOptions));

// --- Security headers ---
app.use(helmet());

// --- Body parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Request context & tracking ---
app.use(correlationId);
app.use(deviceTracking);
app.use(requestLogger);

// --- Routes behind rate limiter ---
app.use('/api', apiLimiter);
app.use('/api', routes);

// --- Root route ---
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'SBI Finance Bank API is running',
    docs: '/api/health',
    frontend: 'https://sbi-finance-bank.vercel.app',
  });
});

// --- Error handling (last) ---
app.use(notFoundHandler);
app.use(errorHandler);

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down...`);
  await Promise.all([disconnectPersonalDb(), disconnectCorporateDb(), closeAllQueues()]);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async () => {
  try {
    await connectPersonalDb();
    await connectCorporateDb();
    await startAllProcessors();
    registerEventHandlers();

    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info('Databases: Personal Banking + Corporate Banking');
      logger.info('Message broker queues initialized: email, transactions, audit, notifications, reports, kyc, loans');
      logger.info('Domain event bus initialized with handlers');
      logger.info('Cross-cutting concerns active: correlation-id, request-logging, async-context');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
