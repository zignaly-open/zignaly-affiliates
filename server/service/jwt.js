import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import { SECRET } from '../config';

export const signToken = id =>
  jwt.sign({ _id: id }, SECRET, { algorithm: 'HS256' });

export const validateJwt = expressJwt({
  secret: SECRET,
  algorithms: ['HS256'],
});
