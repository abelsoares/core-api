
/**
 * Module dependencies.
 */

const filterMiddleware = require('src/core/middlewares/filter-middleware');
const { get } = require('lodash');

/**
 * Test `FilterMiddleware`.
 */

describe('FilterMiddleware', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  it('should call `next` without updating `ctx.requestOptions` if `filter` parameter is not provided', async () => {
    const ctx = { query: {} };

    await filterMiddleware(ctx, next);

    expect(get(ctx, 'requestOptions')).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call `next` without updating `ctx.requestOptions` if `filter` parameter is invalid', async () => {
    const ctx = {
      query: {
        filter: 'foobar'
      }
    };

    await filterMiddleware(ctx, next);

    expect(get(ctx, 'requestOptions')).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call `next` without updating `ctx.requestOptions` if `filter` parameter is an object with invalid keys', async () => {
    const ctx = {
      query: {
        filter: {
          $$: 'foobar'
        }
      }
    };

    await filterMiddleware(ctx, next);

    expect(get(ctx, 'requestOptions')).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call `next` with updated `ctx.requestOptions` with `filter` as valid properties of `ctx.query.filter`', async () => {
    const ctx = {
      query: {
        filter: {
          $$: 'foo',
          biz: 'baz'
        }
      }
    };

    await filterMiddleware(ctx, next);

    expect(get(ctx, 'requestOptions')).toEqual({ where: { biz: 'baz' } });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
