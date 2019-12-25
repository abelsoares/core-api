'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');
const UnauthorizedError = require('src/core/errors/unauthorized-error');

/**
 * Test `UnauthorizedError`.
 */

describe('UnauthorizedError', () => {
  it('should inherit from `HttpError`', () => {
    const error = new UnauthorizedError();

    expect(error).toBeInstanceOf(HttpError);
  });

  it('should have default `code`', () => {
    const error = new UnauthorizedError();

    expect(error.code).toBe(401);
  });

  it('should have default `message`', () => {
    const error = new UnauthorizedError();

    expect(error.message).toBe('Bad Credentials');
  });

  it('should accept `properties`', () => {
    const error = new UnauthorizedError({ foo: 'bar' });

    expect(error.foo).toBe('bar');
  });
});
