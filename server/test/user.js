import supertest from 'supertest';
import assert from 'assert';
import app from '../app';
import { USER_ROLES } from '../model/user';
import * as databaseHandler from './mongo-mock';

const userData = {
  name: 'Alex',
  email: 'alex@xfuturum.com',
  password: 'qwerty',
  role: USER_ROLES.AFFILIATE,
};

const request = (method, url, token) =>
  supertest(app)
    [method](url)
    .set({
      Accept: 'application/json',
      'Content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

const register = data => request('post', '/user').send(data);
const me = token => request('get', '/user/me', token);
const update = (data, token) => request('put', '/user/me', token).send(data);
const login = data => request('post', '/user/auth').send(data);

describe('User', function () {
  before(databaseHandler.connect);
  afterEach(databaseHandler.clearDatabase);
  after(databaseHandler.closeDatabase);

  it('should register & log in', async function () {
    const {
      body: { token },
    } = await register(userData).expect(201);
    assert(token);
    const {
      body: { token: tokenFromLogin },
    } = await login(userData).expect(200);
    assert(tokenFromLogin);
    const { body: user } = await me(token).expect(200);
    assert(user.email, userData.email);
  });

  it('should not log in with invalid pass', async function () {
    await register(userData).expect(201);
    await login({ ...userData, password: 'invalid' }).expect(401);
  });

  it('should not let unauthorized user access protected routes', async function () {
    await me().expect(401);
  });

  it('should not serve protected fields in the response', async function () {
    const {
      body: { token },
    } = await register(userData).expect(201);
    const { body: user } = await me(token).expect(200);
    assert(typeof user.salt === 'undefined');
    assert(typeof user.hashedPassword === 'undefined');
  });

  it('should edit profile', async function () {
    const email = 'alex+1@xfuturum.com';
    const newPassword = '123456';
    const {
      body: { token },
    } = await register(userData).expect(201);
    await update(
      { email, newPassword, oldPassword: `${userData.password}1` },
      token,
    ).expect(403);
    const {
      body: { salt, hashedPassword, email: updatedEmail },
    } = await update(
      { email, newPassword, oldPassword: userData.password },
      token,
    ).expect(200);
    assert(typeof salt === 'undefined');
    assert(typeof hashedPassword === 'undefined');
    assert(updatedEmail === email);
    const { body: user } = await me(token).expect(200);
    assert(user.email === email);
    const {
      body: { token: tokenFromLogin },
    } = await login({ email, password: newPassword }).expect(200);
    assert(tokenFromLogin);
  });

  it('should not let register twice with the same email', async function () {
    await register(userData).expect(201);
    await register(userData).expect(400);
  });
});

// should reset pass
// should not serve password
