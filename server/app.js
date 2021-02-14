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
  bodyParser.json(),
  methodOverride(),
  passport.initialize(),
]);

passport.use('local', localStrategy);

configureRoutes(app);

// global error handler
app.use((error, request, res, next) => {
  if (error.kind === 'ObjectId') {
    // Somebody messed with the id and now it is invalid
    res.status(404).json({
      error: 'Not found - ID invalid',
    });
  } else if (error.name === 'UnauthorizedError') {
    res.status(403).json({
      error: 'Unauthorized',
    });
  } else {
    logError(error);
    // TODO: slack notification?
    res.status(500).json({
      error:
        "Something went wrong. We already know about that and we'll handle that soon",
    });
  }
});

export default app;
