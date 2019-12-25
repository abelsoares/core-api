'use strict';

/**
 * Module dependencies.
 */

const ForbiddenError = require('src/core/errors/forbidden-error');
const permissionMiddleware = require('src/core/middlewares/permission-middleware');

/**
 * Test `PermissionMiddleware`.
 */

describe('PermissionMiddleware', () => {
  let context;
  let next;

  beforeEach(() => {
    next = jest.fn();
    context = {
      state: {
        session: {
          role: 'foo'
        }
      }
    };
  });

  it('should throw a `ForbiddenError` if `role` is not present at `context.state.session`', async () => {
    const permission = permissionMiddleware(['foo']);

    context.state.session = {};

    try {
      await permission(context, next);

      fail();
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenError);
    }
  });

  it('should throw a `ForbiddenError` if `context.state.session.role` does not match any `role`', async () => {
    const permission = permissionMiddleware(['foo', 'bar']);

    context.state.session = { role: 'biz' };

    try {
      await permission(context, next);

      fail();
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenError);
    }
  });

  it('should call `next` if `context.state.session.role` matches a `role`', async () => {
    const permission = permissionMiddleware(['foo', 'bar']);

    await permission(context, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
