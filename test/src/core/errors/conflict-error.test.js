'use strict';

/**
 * Module dependencies.
 */

const ConflictError = require('src/core/errors/conflict-error');
const HttpError = require('standard-http-error');

/**
 * Test `ConflictError`.
 */

describe('ConflictError', () => {
  it('should inherit from `HttpError`', () => {
    const error = new ConflictError();

    expect(error).toBeInstanceOf(HttpError);
  });

  it('should have default `code`', () => {
    const error = new ConflictError();

    expect(error.code).toBe(409);
  });

  it('should accept `message` and `properties`', () => {
    const error = new ConflictError('foo', { foo: 'bar' });

    expect(error.message).toBe('foo');
    expect(error.foo).toBe('bar');
  });
});
