import supertest from 'supertest';
import app from '../app';
import { USER_ROLES } from '../model/user';

export const getSampleData = (role = USER_ROLES.AFFILIATE) => ({
  name: 'Alex',
  email: 'alex@xfuturum.com',
  password: 'qwerty',
  role,
});

export const request = (method, url, token) =>
  supertest(app)
    [method](`/api/v1/${url}`)
    .set({
      Accept: 'application/json',
      'Content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

export const uploadRequest = (file, token) =>
  supertest(app)
    .post(`/api/v1/upload`)
    .attach('media', file)
    .set({ Authorization: `Bearer ${token}` });

export const register = data => request('post', 'user').send(data);

export const me = token => request('get', 'user/me', token);

export const update = (data, token) =>
  request('put', 'user/me', token).send(data);

export const login = data => request('post', 'user/auth').send(data);

export const requestReset = email =>
  request('post', 'user/request-reset').send({ email });

export const validateReset = token =>
  request('get', `user/can-reset?token=${token}`).send({ token });

export const performReset = data => request('post', 'user/reset').send(data);

export const getAffiliate = async () =>
  (
    await register({
      name: 'Alex',
      email: `alex${Math.random()}${Date.now()}@xfuturum.com`,
      password: 'qwerty',
      role: USER_ROLES.AFFILIATE,
    })
  ).body;

export const getAffiliateToken = async () => (await getAffiliate()).token;

export const getMerchant = async () =>
  (
    await register({
      name: 'Alex',
      email: `alex${Math.random()}${Date.now()}@xfuturum.com`,
      password: 'qwerty',
      role: USER_ROLES.MERCHANT,
    })
  ).body;

export const getMerchantToken = async () => (await getMerchant()).token;
