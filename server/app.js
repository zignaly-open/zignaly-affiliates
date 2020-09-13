import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import passport from 'passport';
import compression from 'compression';
import configureRoutes from './routes';
import { logError } from './service/logger';
import localStrategy from './service/passport/local-strategy';

mongoose.set('useCreateIndex', true);

// Setup server
const app = express();
app.use([
  compression(),
  cors(),
  // bodyParser.urlencoded({ extended: false }),
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

passport.use('local', localStrategy);

configureRoutes(app);

export default app;
