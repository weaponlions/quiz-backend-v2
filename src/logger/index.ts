import winston from 'winston';
import 'winston-daily-rotate-file';

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  dirname: 'logs',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

const customFormat = winston.format.printf(({ timestamp, urlPath, requestedUser, status, message }) => {
  return `${timestamp} [${status}] ${urlPath} - User: ${requestedUser} - ${message}`;
});

export const customLogger = winston.createLogger({
  level: 'info', // Log level (e.g., info, error, debug)
  format: winston.format.combine(
    winston.format.timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    dailyRotateFileTransport,
  ],
});


