import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import passport from 'passport';
import compression from 'compression';
import http from 'http';
import config from './config';
import configureRoutes from './routes';
import { log, logError } from './service/logger';

// special treatment for tests
if (config.environment !== 'test') {
  // Connect to database
  mongoose.connect(config.mongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.Promise = global.Promise;
}

// Setup server
const app = express();
app.use([
  compression(),
  cors(),
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json(),
  methodOverride(),
  passport.initialize(),
]);

// global error handler
// eslint-disable-next-line no-unused-vars
app.use((error, request, res, next) => {
  logError(error);
  res.status(500).send({
    error:
      "Something went wrong. We already know about that and we'll handle that soon",
  });
});

const server = http.createServer(app);
configureRoutes(app);

// Start server
server.listen(config.port, config.host, () => {
  log(`Running on ${config.port} in ${config.environment}`);
});
