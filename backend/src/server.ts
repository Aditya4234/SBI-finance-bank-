import 'express-async-errors';
import express from 'express';
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

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(correlationId);
app.use(deviceTracking);
app.use(requestLogger);

app.use('/api', apiLimiter);
app.use('/api', routes);

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
