import winston from 'winston';
import { config } from './index';
import { getContext } from '../context/app-context';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const correlationFormat = winston.format((info) => {
  const ctx = getContext();
  info.correlationId = ctx.correlationId;
  return info;
});

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, correlationId }) => {
    const cid = correlationId ? ` [${correlationId}]` : '';
    return `${timestamp}${cid} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  format
);

export const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  levels,
  format: winston.format.combine(correlationFormat(), format),
  transports: [
    new winston.transports.Console({ format: winston.format.combine(correlationFormat(), consoleFormat) }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error', format: winston.format.combine(correlationFormat(), format) }),
    new winston.transports.File({ filename: 'logs/combined.log', format: winston.format.combine(correlationFormat(), format) }),
  ],
});
