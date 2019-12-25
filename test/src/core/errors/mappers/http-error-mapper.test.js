'use strict';

/**
 * Module dependencies.
 */

const { map } = require('src/core/errors/mappers/http-error-mapper');

/**
 * Test `HttpErrorMapper`.
 */

describe('HttpErrorMapper', () => {
  it('should return nothing if the `error` is not an instance of `HttpError`', () => {
    expect(map(new Error())).toBeUndefined();
  });
});
