import dotenv from 'dotenv';

dotenv.config();

const { env } = process;

// Set default node environment to development
env.NODE_ENV = env.NODE_ENV || 'dev';

export const ENVIRONMENT = env.NODE_ENV;
export const SECRET = env.SECRET || 'changeme777';
export const LOG_PATH = 'logs/combined.log';
export const PORT = env.PORT || 7777;
export const HOST = env.HOST || '0.0.0.0';
export const MONGO_URL = env.MONGO || 'mongodb://localhost:27017/zignaly-ref';
export const PASSWORD_RESET_TOKEN_TTL = 24 * 3600 * 1000;
