'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');
const InvalidArgumentError = require('src/core/errors/invalid-argument-error');

/**
 * Test `InvalidArgumentError`.
 */

describe('InvalidArgumentError', () => {
  it('should inherit from `HttpError`', () => {
    const error = new InvalidArgumentError();

    expect(error).toBeInstanceOf(HttpError);
  });

  it('should have default `code`', () => {
    const error = new InvalidArgumentError();

    expect(error.code).toBe(500);
  });

  it('should accept `message` and `properties`', () => {
    const error = new InvalidArgumentError('foo', { foo: 'bar' });

    expect(error.message).toBe('foo');
    expect(error.foo).toBe('bar');
  });
});
