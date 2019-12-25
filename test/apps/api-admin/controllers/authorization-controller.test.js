'use strict';

/**
 * Module dependencies.
 */

const fixtures = require('test/utils/fixtures');
const mailjet = require('test/utils/mocks/mailjet-mocks');
const sessionManager = require('src/core/authorization/managers/session-manager');
const supertest = require('test/utils/request')('/v0');
const tokenizer = require('src/core/utils/tokenizer');
const { flushRedis } = require('test/utils/helpers/database-helper');

/**
 * Test `AuthorizationController`.
 */

describe('AuthorizationController', () => {
  const request = supertest(fixtures.loadApp());
  let token;

  afterEach(async () => {
    await flushRedis();
  });

  beforeEach(async () => {
    token = await fixtures.generateToken();
  });

  describe('POST /auth/revoke', () => {
    it('should return 401 if the request has invalid token', async () => {
      await request
        .post('/auth/revoke')
        .set('Authorization', 'Bearer foobar')
        .expect(401);
    });

    it('should destroy session for given `ctx.state.session`', async () => {
      await request
        .post('/auth/revoke')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const { sessionId } = tokenizer.decode(token);
      const session = await sessionManager.get(sessionId);

      expect(session).toEqual({});
    });
  });

  describe('POST /auth/token', () => {
    it('should create a valid session for the user with given `email` and `password`', async () => {
      mailjet.send.succeed();

      const { id } = await fixtures.loadUser({ email: 'foo@bar.com', password: 'bizbaz', role: 'admin' });

      await request
        .post('/auth/token')
        .send({ email: 'foo@bar.com', password: 'bizbaz' })
        .expect(200)
        .expect(async ({ body: { data } }) => {
          const { sessionId } = tokenizer.decode(data.token);
          const { userId } = await sessionManager.get(sessionId);

          expect(userId).toEqual(id);
          expect(data.role).toEqual('admin');
        });
    });
  });
});
