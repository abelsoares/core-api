'use strict';

/**
 * Module dependencies.
 */

const authorizationMiddleware = require('src/core/middlewares/authorization-middleware');
const sessionManager = require('src/core/authorization/managers/session-manager');
const tokenizer = require('src/core/utils/tokenizer');
const UnauthorizedError = require('src/core/errors/unauthorized-error');

/**
 * Test `AuthorizationMiddleware`.
 */

describe('AuthorizationMiddleware', () => {
  let context;
  let next;
  let token;

  beforeEach(() => {
    token = tokenizer.encode({ sessionId: 'foo' });
    context = {
      get: jest.fn(() => `Bearer ${token}`),
      state: {}
    };

    sessionManager.get = jest.fn(() => ({ userId: 'biz' }));
    sessionManager.expire = jest.fn();
    next = jest.fn();
  });

  it('should call `context.get` with `Authorization`', async () => {
    await authorizationMiddleware(context, next);

    expect(context.get).toHaveBeenCalledTimes(1);
    expect(context.get).toHaveBeenCalledWith('Authorization');
  });

  it('should throw an `Unauthorized` error if the authorization header scheme is invalid', async () => {
    context.get = jest.fn(() => `foo ${token}`);

    try {
      await authorizationMiddleware(context, next);

      fail();
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedError);
    }
  });

  it('should throw an `Unauthorized` error if `tokenizer.decode` throws', async () => {
    context.get = jest.fn(() => 'Bearer foobar');

    try {
      await authorizationMiddleware(context, next);

      fail();
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedError);
    }
  });

  it('should call `sessionManager.get` with the value of `sessionId` of the result of `tokenizer.decode`', async () => {
    await authorizationMiddleware(context, next);

    expect(sessionManager.get).toHaveBeenCalledTimes(1);
    expect(sessionManager.get).toHaveBeenCalledWith('foo');
  });

  it('should throw an `Unauthorized` error if the result of `sessionManager.get` has a falsy `userId` value', async () => {
    sessionManager.get = jest.fn(() => ({ userId: '' }));

    try {
      await authorizationMiddleware(context, next);

      fail();
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthorizedError);
    }
  });

  it('should call `sessionManager.expire` with the value of `sessionId` of the result of `tokenizer.decode` and configured session duration in seconds', async () => {
    await authorizationMiddleware(context, next);

    expect(sessionManager.expire).toHaveBeenCalledTimes(1);
    expect(sessionManager.expire).toHaveBeenCalledWith('foo', 1);
  });

  it('should set `context.state.session` with the value of `sessionId`, `role` and `userId`', async () => {
    sessionManager.get = jest.fn(() => ({ role: 'biz', userId: 'baz' }));

    await authorizationMiddleware(context, next);

    expect(context.state.session).toEqual({
      id: 'foo',
      role: 'biz',
      userId: 'baz'
    });
  });
});
