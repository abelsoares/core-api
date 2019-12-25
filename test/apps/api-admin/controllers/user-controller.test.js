'use strict';

/**
 * Module dependencies.
 */

const fixtures = require('test/utils/fixtures');
const mailjet = require('test/utils/mocks/mailjet-mocks');
const redis = require('src/core/clients/redis');
const roles = require('src/user/enums/role-enum');
const sessionManager = require('src/core/authorization/managers/session-manager');
const supertest = require('test/utils/request')('/v0');
const tokenizer = require('src/core/utils/tokenizer');
const userManager = require('src/user/managers/user-manager');
const uuid = require('uuid/v4');
const { replace } = require('lodash');

/**
 * Test `UserController`.
 */

describe('UserController', () => {
  const request = supertest(fixtures.loadApp());
  let adminToken;
  let token;

  beforeEach(async () => {
    adminToken = await fixtures.generateToken({ role: 'admin' });
    token = await fixtures.generateToken({ role: 'standard' });
  });

  describe('GET /users', () => {
    it('should return 401 if the request has an invalid token', async () => {
      await request
        .get('/users')
        .set('Authorization', 'Bearer foobar')
        .expect(401);
    });

    it('should return 403 if the user as invalid permissions', async () => {
      await request
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return the requested number of users', async () => {
      mailjet.send.succeed();
      mailjet.send.succeed();
      mailjet.send.succeed();

      await fixtures.loadUser({ email: 'foo@bar.com', role: 'admin' });
      await fixtures.loadUser({ email: 'biz@bar.com', role: 'admin' });
      await fixtures.loadUser({ email: 'baz@bar.com', role: 'admin' });

      await request
        .get('/users?page[number]=2&page[size]=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(({ body: { data, total } }) => {
          expect(data.length).toEqual(1);
          expect(total).toEqual(3);

          data.forEach(user => expect(user).toBeMaskedInstanceWithScope('user', 'admin'));
        });
    });

    it('should allow filtering', async () => {
      mailjet.send.succeed();
      mailjet.send.succeed();

      await fixtures.loadUser({ role: 'admin' });
      await fixtures.loadUser({ email: 'foo@biz.com', role: 'standard' });

      await request
        .get('/users?filter[role]=standard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(({ body: { data } }) => {
          expect(data.length).toBe(1);

          const [user] = data;

          expect(user.role).toBe('standard');
          data.forEach(user => expect(user).toBeMaskedInstanceWithScope('user', 'admin'));
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return 401 if the request has an invalid token', async () => {
      await request
        .get(`/users/${uuid()}`)
        .set('Authorization', 'Bearer foobar')
        .expect(401);
    });

    it('should return 403 if the user as invalid permissions', async () => {
      await request
        .get(`/users/${uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return a user', async () => {
      mailjet.send.succeed();

      const { id } = await fixtures.loadUser({ role: 'admin' });

      await request
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(({ body: { data } }) => expect(data).toBeMaskedInstanceWithScope('user', 'admin'));
    });
  });

  describe('GET /users/me', () => {
    it('should return 401 if the request has an invalid token', async () => {
      await request
        .get('/users/me')
        .set('Authorization', 'Bearer foobar')
        .expect(401);
    });

    it('should return 403 if the user as invalid permissions', async () => {
      await request
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return the authenticated user', async () => {
      mailjet.send.succeed();

      const { id: userId, role } = await fixtures.loadUser({ role: 'admin' });
      const token = await fixtures.generateToken({ role, userId });

      await request
        .get(`/users/me`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(({ body: { data } }) => {
          expect(data.id).toEqual(userId);
          expect(data).toBeMaskedInstanceWithScope('user', 'admin');
        });
    });
  });

  describe('POST /users', () => {
    it('should return 409 if the email already exists', async () => {
      mailjet.send.succeed();

      const { email } = await fixtures.loadUser({ role: 'admin' });

      await request
        .post('/users')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, name: 'foo', password: 'foobar', role: 'admin' })
        .expect(409);
    });

    it('should return 401 if the request has an invalid token', async () => {
      await request
        .post('/users')
        .set('Authorization', 'Bearer foobar')
        .expect(401);
    });

    it('should return 403 if the user as invalid permissions', async () => {
      await request
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should create a user', async () => {
      mailjet.send.succeed();

      await request
        .post('/users')
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'foo@bar.com', name: 'foo', password: 'foobar', role: 'admin' })
        .expect(200)
        .expect(({ body: { data } }) => expect(data).toBeMaskedInstanceWithScope('user', 'admin'));
    });
  });

  describe('POST /users/password/change', () => {
    it('should return 401 if the request has an invalid token', async () => {
      await request
        .post('/users/password/change')
        .set('Authorization', 'Bearer foobar')
        .expect(401);
    });

    it('should return 400 if `oldPassword` is missing', async () => {
      mailjet.send.succeed();

      const user = await fixtures.loadUser({ role: 'admin' });
      const token = await fixtures.generateToken({ role: 'admin', userId: user.id });

      await request
        .post('/users/password/change')
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ password: 'foobar' })
        .expect(400)
        .expect({
          code: 'validation_failed',
          errors: [{ oldPassword: 'required' }]
        });
    });

    it('should return 400 if `password` is missing', async () => {
      mailjet.send.succeed();

      const user = await fixtures.loadUser({ role: 'admin' });
      const token = await fixtures.generateToken({ role: 'admin', userId: user.id });

      await request
        .post('/users/password/change')
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ oldPassword: 'foobar' })
        .expect(400)
        .expect({
          code: 'validation_failed',
          errors: [{ password: 'required' }]
        });
    });

    it('should return 400 if `password` is invalid', async () => {
      mailjet.send.succeed();

      const user = await fixtures.loadUser({ role: 'admin' });
      const token = await fixtures.generateToken({ role: 'admin', userId: user.id });

      await request
        .post('/users/password/change')
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ oldPassword: 'foobar', password: 'a' })
        .expect(400)
        .expect({
          code: 'validation_failed',
          errors: [{ password: 'minLength' }]
        });
    });

    it('should return 400 if `oldPassword` does not match', async () => {
      mailjet.send.succeed();

      const user = await fixtures.loadUser({ role: 'admin' });
      const token = await fixtures.generateToken({ role: 'admin', userId: user.id });

      await request
        .post('/users/password/change')
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ oldPassword: 'foobiz', password: 'bizqux' })
        .expect(400)
        .expect({
          code: 'validation_failed',
          errors: [{ isOldPasswordValid: 'const' }]
        });
    });

    it('should return 400 if `password` is the same as the old user password', async () => {
      mailjet.send.succeed();

      const user = await fixtures.loadUser({ role: 'admin' });
      const token = await fixtures.generateToken({ role: 'admin', userId: user.id });

      await request
        .post('/users/password/change')
        .set('Authorization', `Bearer ${token}`)
        .set('content-type', 'application/json')
        .send({ oldPassword: 'foobar', password: 'foobar' })
        .expect(400)
        .expect({
          code: 'validation_failed',
          errors: [{ isNewPasswordTheSame: 'const' }]
        });
    });

    roles.forEach(role => {
      it(`should change the password for role \`${role}\``, async () => {
        mailjet.send.succeed();
        mailjet.send.succeed();

        const user = await fixtures.loadUser({ role });
        const token = await fixtures.generateToken({ role, userId: user.id });

        await request
          .post('/users/password/change')
          .set('Authorization', `Bearer ${token}`)
          .set('content-type', 'application/json')
          .send({ oldPassword: 'foobar', password: 'bizqux' })
          .expect(204);

        const { sessionId } = tokenizer.decode(token);
        const session = await sessionManager.get(sessionId);

        expect(session).toEqual({});
      });
    });
  });

  describe('POST /users/password/forgot', () => {
    it('should return 400 if `email` is missing', async () => {
      await request
        .post('/users/password/forgot')
        .set('content-type', 'application/json')
        .expect(400)
        .expect({
          code: 'validation_failed',
          errors: [{ email: 'required' }]
        });
    });

    it('should return 400 if `email` is invalid', async () => {
      await request
        .post('/users/password/forgot')
        .set('content-type', 'application/json')
        .send({ email: 'foo' })
        .expect(400)
        .expect({
          code: 'validation_failed',
          errors: [{ email: 'format' }]
        });
    });

    it('should return 204 if it fails to find the user', async () => {
      await request
        .post('/users/password/forgot')
        .send({ email: 'foo@bar.com' })
        .expect(204);
    });

    it('should return 500 if `findOne` throws an unknown error', async () => {
      jest.spyOn(userManager, 'findOne').mockImplementation(() => { throw new Error(); });

      await request
        .post('/users/password/forgot')
        .send({ email: 'foo@bar.com' })
        .expect(500);

      expect(userManager.findOne).toHaveBeenCalled();
    });

    it('should start the reset password process', async () => {
      mailjet.send.succeed();
      mailjet.send.succeed();

      const { email } = await fixtures.loadUser({ role: 'standard', status: 'active' });

      await request
        .post('/users/password/forgot')
        .set('content-type', 'application/json')
        .send({ email })
        .expect(204);
    });
  });

  describe('POST /users/password/reset', () => {
    it('should return 403 if token is missing', async () => {
      await request
        .post('/users/password/reset')
        .set('content-type', 'application/json')
        .expect(403);
    });

    it('should return 404 if fails to find the user with the specified token', async () => {
      await request
        .post('/users/password/reset')
        .set('content-type', 'application/json')
        .query({ token: 'foo' })
        .send({ password: 'barfoo' })
        .expect(404);
    });

    it('should reset the user password', async () => {
      jest.spyOn(redis, 'setex');
      mailjet.send.succeed();
      mailjet.send.succeed();
      mailjet.send.succeed();

      const user = await fixtures.loadUser({ role: 'standard', status: 'active' });

      await userManager.forgotPassword({ user });

      const token = replace(redis.setex.mock.calls[1][0], 'reset:', '');

      await request
        .post('/users/password/reset')
        .set('content-type', 'application/json')
        .query({ token })
        .send({ password: 'barfoo' })
        .expect(204);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should return 401 if the request has an invalid token', async () => {
      await request
        .patch(`/users/${uuid()}`)
        .set('Authorization', 'Bearer foobar')
        .expect(401);
    });

    it('should return 403 if the user as invalid permissions', async () => {
      await request
        .patch(`/users/${uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 if it fails to find the user', async () => {
      await request
        .patch(`/users/${uuid()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('content-type', 'application/json')
        .send({ email: 'biz@baz.com' })
        .expect(404);
    });

    it('should return 400 if the body has `password`', async () => {
      await request
        .patch(`/users/${uuid()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('content-type', 'application/json')
        .send({ email: 'biz@baz.com', password: 'foobar' })
        .expect(400);
    });

    it('should return 400 if the body has `review`', async () => {
      await request
        .patch(`/users/${uuid()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('content-type', 'application/json')
        .send({ email: 'biz@baz.com', review: {} })
        .expect(400);
    });

    it('should return 400 if the body has `status`', async () => {
      await request
        .patch(`/users/${uuid()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('content-type', 'application/json')
        .send({ email: 'biz@baz.com', status: 'active' })
        .expect(400);
    });

    it('should update an existing user', async () => {
      mailjet.send.succeed();

      const { id } = await fixtures.loadUser({ role: 'admin' });

      await request
        .patch(`/users/${id}`)
        .set('content-type', 'application/json')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'biz@baz.com' })
        .expect(200)
        .expect(({ body: { data } }) => {
          expect(data.email).toEqual('biz@baz.com');
          expect(data).toBeMaskedInstanceWithScope('user', 'admin');
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return 401 if the request has an invalid token', async () => {
      await request
        .delete(`/users/${uuid()}`)
        .set('Authorization', 'Bearer foobar')
        .expect(401);
    });

    it('should return 403 if the user as invalid permissions', async () => {
      await request
        .delete(`/users/${uuid()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 if it fails to find the user', async () => {
      await request
        .delete(`/users/${uuid()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 if the user was already deleted', async () => {
      mailjet.send.succeed();

      const { id } = await fixtures.loadUser({ role: 'admin' });

      await userManager.delete({ where: { id } });

      await request
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should delete an existing user', async () => {
      mailjet.send.succeed();

      const { id } = await fixtures.loadUser({ role: 'admin' });

      await request
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});
