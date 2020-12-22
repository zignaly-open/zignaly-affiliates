import winston from 'winston';
import { LOG_PATH } from '../config';

const { createLogger, format } = winston;
const { combine, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${
    typeof message === 'string' ? message : JSON.stringify(message)
  }`;
});

const logger = createLogger({
  format: combine(format.timestamp(), myFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: LOG_PATH }),
  ],
});

export const log = message => logger.log({ level: 'info', message });
export const logError = message => {
  console.error(message)
  logger.log({ level: 'error', message });
}
