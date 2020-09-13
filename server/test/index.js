import request from 'supertest';
import assert from 'assert';
import app from '../app';

describe('Ping-pong', function () {
  it('should run', function () {
    return request(app)
      .get('/ping')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => assert(response.body.message, 'pong'));
  });
});
