import winston from 'winston';
import { botConfig } from '@/config/bot.config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// Create format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: botConfig.logLevel,
  }),
];

// Add file transport for production
if (botConfig.environment === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
    })
  );
}

// Create the logger
export const logger = winston.createLogger({
  levels,
  level: botConfig.logLevel,
  format: fileFormat,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    ...(botConfig.environment === 'production' 
      ? [new winston.transports.File({ filename: 'logs/exceptions.log' })]
      : []
    ),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    ...(botConfig.environment === 'production' 
      ? [new winston.transports.File({ filename: 'logs/rejections.log' })]
      : []
    ),
  ],
});

// Add stream for morgan or other middleware (if needed)
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Helper functions for structured logging
export const logBotEvent = (event: string, data?: any) => {
  logger.info(`Bot Event: ${event}`, data);
};

export const logUserAction = (action: string, userId?: number, data?: any) => {
  logger.info(`User Action: ${action}`, { userId, ...data });
};

export const logError = (error: Error, context?: any) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const logApiCall = (endpoint: string, duration: number, status: number) => {
  logger.info('API Call', {
    endpoint,
    duration,
    status,
  });
};

export default logger; 