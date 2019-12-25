'use strict';

/**
 * Module dependencies.
 */

const authorizationManager = require('src/core/authorization/managers/authorization-manager');
const fixtures = require('test/utils/fixtures');
const mailjet = require('test/utils/mocks/mailjet-mocks');
const sessionManager = require('src/core/authorization/managers/session-manager');
const tokenizer = require('src/core/utils/tokenizer');
const UnauthorizedError = require('src/core/errors/unauthorized-error');
const ValidationFailedError = require('src/core/errors/validation-failed-error');
const { flushRedis } = require('test/utils/helpers/database-helper');

/**
 * Test `AuthorizationManager`.
 */

describe('AuthorizationManager', () => {
  afterEach(async () => {
    await flushRedis();
  });

  describe('login()', () => {
    it('should throw a `ValidationFailedError` if `data` is invalid', async () => {
      try {
        await authorizationManager.login({ data: {} });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw a `ValidationFailedError` if `email` is not provided', async () => {
      try {
        await authorizationManager.login({ data: { password: 'bizbaz' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw a `ValidationFailedError` if `email` is invalid', async () => {
      try {
        await authorizationManager.login({ data: { email: 'foobar', password: 'bizbaz' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw a `ValidationFailedError` if `password` is not provided', async () => {
      try {
        await authorizationManager.login({ data: { email: 'foo@bar.com' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw a `ValidationFailedError` if `password` is invalid', async () => {
      try {
        await authorizationManager.login({ data: { email: 'foo@bar.com', password: 'foo' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw an `UnauthorizedError` if user with given `email` does not exist', async () => {
      try {
        await authorizationManager.login({ data: { email: 'biz@baz.com', password: 'foobar' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedError);
      }
    });

    it('should throw an `UnauthorizedError` if user with given `email` has `status` as `blocked`', async () => {
      mailjet.send.succeed();

      const { email } = await fixtures.loadUser({ role: 'admin', status: 'blocked' });

      try {
        await authorizationManager.login({ data: { email, password: 'foobar' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedError);
      }
    });

    it('should throw an `UnauthorizedError` if `password` does not match the password of the user with given `email`', async () => {
      mailjet.send.succeed();

      const { email } = await fixtures.loadUser({ email: 'foo@bar.com', password: 'bizbaz', role: 'admin' });

      try {
        await authorizationManager.login({ data: { email, password: 'foobar' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedError);
      }
    });

    ['active', 'restricted'].forEach(status => {
      it(`should create a session for a user with status \`${status}\``, async () => {
        mailjet.send.succeed();

        const { id } = await fixtures.loadUser({ email: 'foo@bar.com', password: 'foobar', role: 'admin', status });
        const { token } = await authorizationManager.login({ data: { email: 'foo@bar.com', password: 'foobar' } });
        const { sessionId } = tokenizer.decode(token);
        const session = await sessionManager.get(sessionId);

        expect(session).toEqual({ role: 'admin', userId: id });
      });
    });

    it('return the user `role` and session `token`', async () => {
      mailjet.send.succeed();

      const { id } = await fixtures.loadUser({ email: 'foo@bar.com', password: 'foobar', role: 'admin' });
      const { role, token } = await authorizationManager.login({ data: { email: 'foo@bar.com', password: 'foobar' } });
      const { sessionId } = tokenizer.decode(token);
      const { userId } = await sessionManager.get(sessionId);

      expect(role).toEqual('admin');
      expect(userId).toEqual(id);
    });
  });
});
