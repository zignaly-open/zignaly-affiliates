import dotenv from 'dotenv';

dotenv.config();

const { env } = process;

// Set default node environment to development
env.NODE_ENV = env.NODE_ENV || 'dev';

export default {
  logPath: 'logs/combined.log',
  environment: env.NODE_ENV,
  secret: env.SECRET || 'changeme777',
  port: env.PORT || 7777,
  mongo: env.MONGO || 'mongodb://localhost:27017/zignaly-ref',
  host: env.HOST || '0.0.0.0',
};
