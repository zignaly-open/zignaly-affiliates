import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import config from '../config';

export const signToken = id =>
  jwt.sign({ _id: id }, config.secret, { algorithm: 'HS256' });
export const validateJwt = expressJwt({
  secret: config.secret,
  algorithms: ['HS256'],
});
