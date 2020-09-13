import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import { log } from './service/logger';
import config from './config';

// Connect to database
mongoose.connect(config.mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise;

const server = http.createServer(app);
// Start server
server.listen(config.port, config.host, () => {
  log(`Running on ${config.port} in ${config.environment}`);
});
