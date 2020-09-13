import winston from 'winston';
import config from '../config';

const { createLogger, format } = winston;
const { combine, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(format.timestamp(), myFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: config.logPath }),
  ],
});

export const log = message => logger.log({ level: 'info', message });
export const logError = message => logger.log({ level: 'error', message });
