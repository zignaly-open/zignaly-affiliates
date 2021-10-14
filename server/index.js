import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import { log } from './service/logger';
import { ENVIRONMENT, HOST, MONGO_URL, PORT, RDS_CA_NAME } from './config';

// Connect to database
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tlsCAFile: RDS_CA_NAME
});

mongoose.Promise = global.Promise;

const server = http.createServer(app);
// Start server
server.listen(PORT, HOST, () => {
  log(`Running on ${PORT} in ${ENVIRONMENT}`);
});
