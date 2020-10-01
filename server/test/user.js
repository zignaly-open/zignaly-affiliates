import supertest from 'supertest';
import assert from 'assert';
import app from '../app';
import User, { USER_ROLES } from '../model/user';
import * as databaseHandler from './mongo-mock';
import { PASSWORD_RESET_TOKEN_TTL } from '../config';

const userData = {
  name: 'Alex',
  email: 'alex@xfuturum.com',
  password: 'qwerty',
  role: USER_ROLES.AFFILIATE,
};

const request = (method, url, token) =>
  supertest(app)
    [method](`/api/v1/${url}`)
    .set({
      Accept: 'application/json',
      'Content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

const register = data => request('post', 'user').send(data);
const me = token => request('get', 'user/me', token);
const update = (data, token) => request('put', 'user/me', token).send(data);
const login = data => request('post', 'user/auth').send(data);
const requestReset = email =>
  request('post', 'user/request-reset').send({ email });
const validateReset = token =>
  request('get', `user/can-reset?token=${token}`).send({ token });
const performReset = data => request('post', 'user/reset').send(data);

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
    await me().expect(403);
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
    const {
      body: { errors },
    } = await register(userData).expect(400);
    assert(errors.email === 'The specified email address is already in use.');
  });

  it('should reset password', async function () {
    await register(userData).expect(201);
    await requestReset(userData.email).expect(200);
    await requestReset(`${userData.email}a`).expect(404);
    const user = await User.findOne(
      { email: userData.email },
      '+resetPasswordToken +resetPasswordTokenExpirationDate',
    );
    assert(user.resetPasswordToken);
    assert(user.resetPasswordTokenExpirationDate > Date.now());
    assert(
      user.resetPasswordTokenExpirationDate <=
        Date.now() + PASSWORD_RESET_TOKEN_TTL,
    );
    const {
      body: { success: canReset },
    } = await validateReset(user.resetPasswordToken).expect(200);
    const {
      body: { success: canNotReset },
    } = await validateReset(`${user.resetPasswordToken}1`).expect(200);
    assert(canReset);

    assert(!canNotReset);
    const newPassword = '11111';
    const {
      body: { token },
    } = await performReset({
      token: user.resetPasswordToken,
      password: newPassword,
    }).expect(200);
    assert(token);
    await login(userData).expect(401);
    await login({ email: userData.email, password: newPassword }).expect(200);
  });

  it('should not reset password after the ttl', async function () {
    await register(userData).expect(201);
    await requestReset(userData.email).expect(200);
    const user = await User.findOne(
      { email: userData.email },
      '+resetPasswordToken +resetPasswordTokenExpirationDate',
    );
    user.resetPasswordTokenExpirationDate = Date.now() - 1;
    await user.save();
    const {
      body: { success: canNotReset },
    } = await validateReset(user.resetPasswordToken);
    assert(!canNotReset);
  });
});

// should reset pass
// should not serve password
