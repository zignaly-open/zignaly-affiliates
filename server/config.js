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
export const { RECAPTCHA_SERVER_KEY } = env;
export const PASSWORD_RESET_TOKEN_TTL = 15 * 60 * 1000;
export const SENDGRID_API_KEY = env.SENDGRID;
export const SENDGRID_FROM_EMAIL =
  env.SENDGRID_FROM_EMAIL || 'hello@zignaly.com';
export const SENDGRID_CC_FOR_USER_EMAILS =
  env.SENDGRID_CC_FOR_USER_EMAILS || 'hello@zignaly.com';
export const PROJECT_HOME_URL =
  env.PROJECT_HOME_URL || 'https://affiliate.zignaly.com/';
export const MAIN_PROJECT_URL =
  env.PROJECT_HOME_URL || 'https://zignaly.com/';
