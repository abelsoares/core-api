
/**
 * Module dependencies.
 */

const sortMiddleware = require('src/core/middlewares/sort-middleware');
const { get } = require('lodash');

/**
 * Test `SortMiddleware`.
 */

describe('SortMiddleware', () => {
  const next = jest.fn();

  it('should call `next` without updating `context.requestOptions` if `sort` parameter is not provided', async () => {
    const context = { query: {} };

    await sortMiddleware(context, next);

    expect(get(context, 'requestOptions')).toBeUndefined();
  });

  it('should update `context.requestOptions` with `sort` as an empty array if `sort` parameter is invalid', async () => {
    const context = {
      query: {
        sort: '$$'
      }
    };

    await sortMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ sort: [] });
  });

  it('should update `context.requestOptions` with `sort` as an array with the valid provided sort options on the `sort` parameter', async () => {
    const context = {
      query: {
        sort: '$$,field'
      }
    };

    await sortMiddleware(context, next);

    expect(get(context, 'requestOptions')).toEqual({ sort: [{ direction: 'asc', field: 'field' }] });
  });

  it('should update `context.requestOptions` with `sort` as an array with the provided sort options on the `sort` parameter', async () => {
    const context = {
      query: {
        sort: 'foobar'
      }
    };

    await sortMiddleware(context, next);

    const expected = [
      {
        direction: 'asc',
        field: 'foobar'
      }
    ];

    expect(get(context, 'requestOptions')).toEqual({ sort: expected });
  });

  it('should update `context.requestOptions` with `sort` as an array with all comma seperated options provided by `sort` parameter', async () => {
    const context = {
      query: {
        sort: 'foobar,-foobiz,created-At_2'
      }
    };

    await sortMiddleware(context, next);

    const expected = [
      {
        direction: 'asc',
        field: 'foobar'
      },
      {
        direction: 'desc',
        field: 'foobiz'
      },
      {
        direction: 'asc',
        field: 'created-At_2'
      }
    ];

    expect(get(context, 'requestOptions')).toEqual({ sort: expected });
  });
});
