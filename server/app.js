import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cors from 'cors';
import passport from 'passport';
import compression from 'compression';
import './service/trim-mongoose-errors-plugin';
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

passport.use('local', localStrategy);

configureRoutes(app);


// global error handler
app.use((error, request, res, next) => {
  if (error.name !== 'UnauthorizedError') logError(error);
  res.status(error.name === 'UnauthorizedError' ? 403 : 500).json({
    error:
      error.name === 'UnauthorizedError'
        ? 'Unauthorized'
        : "Something went wrong. We already know about that and we'll handle that soon",
  });
});

export default app;
