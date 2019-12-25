'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const paginateMiddleware = require('src/core/middlewares/paginate-middleware');
const { get } = require('lodash');

/**
 * Default page size.
 */

const { maximum, size } = config.get('pagination.default');

/**
 * Test `PaginateMiddleware`.
 */

describe('PaginateMiddleware', () => {
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  it('should update `context.requestOptions` with the default page settings if page not defined', async () => {
    const context = { query: {} };

    await paginateMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ page: { number: 1, size } });
    expect(next).toHaveBeenCalled();
  });

  it('should update `context.requestOptions` with the default page settings if `page[number]` is less than 0', async () => {
    const context = {
      query: {
        page: { number: -1 }
      }
    };

    await paginateMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ page: { number: 1, size } });
    expect(next).toHaveBeenCalled();
  });

  it('should update `context.requestOptions` with the default page settings if `page[number]` is not a number', async () => {
    const context = {
      query: {
        page: {
          number: 'foobar'
        }
      }
    };

    await paginateMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ page: { number: 1, size } });
    expect(next).toHaveBeenCalled();
  });

  it('should update `context.requestOptions` with a valid page number and the default page size', async () => {
    const context = {
      query: {
        page: { number: 33 }
      }
    };

    await paginateMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ page: { number: 33, size } });
  });

  it('should update `context.requestOptions` with the default page settings if `page[size]` is less than 0', async () => {
    const context = {
      query: {
        page: { size: -1 }
      }
    };

    await paginateMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ page: { number: 1, size } });
    expect(next).toHaveBeenCalled();
  });

  it('should update `context.requestOptions` with the default page settings if `page[size]` is not a number', async () => {
    const context = {
      query: {
        page: { size: 'foobar' }
      }
    };

    await paginateMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ page: { number: 1, size } });
    expect(next).toHaveBeenCalled();
  });

  it('should update `context.requestOptions` with the default page settings if `page[size]` is over the `maximum` configuration', async () => {
    const context = {
      query: {
        page: { size: maximum + 1 }
      }
    };

    await paginateMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ page: { number: 1, size } });
    expect(next).toHaveBeenCalled();
  });

  it('should update `context.requestOptions` with a valid page size and the default page number', async () => {
    const context = {
      query: {
        page: { size: 1 }
      }
    };

    await paginateMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ page: { number: 1, size: 1 } });
    expect(next).toHaveBeenCalled();
  });

  it('should update `context.requestOptions` with a valid page number and size', async () => {
    const context = {
      query: {
        page: {
          number: 6,
          size: 10
        }
      }
    };

    await paginateMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ page: { number: 6, size: 10 } });
    expect(next).toHaveBeenCalled();
  });
});
