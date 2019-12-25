'use strict';

/**
 * Module dependencies.
 */

const { map } = require('src/core/errors/mappers/malformed-request-body-error-mapper');

/**
 * Test `MalformedRequestBodyErrorMapper`.
 */

describe('MalformedRequestBodyErrorMapper', () => {
  it('should return nothing if the `error` is not an instance of `MalformedRequestBodyError`', () => {
    expect(map(new Error())).toBeUndefined();
  });
});
