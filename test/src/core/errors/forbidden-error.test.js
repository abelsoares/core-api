'use strict';

/**
 * Module dependencies.
 */

const ForbiddenError = require('src/core/errors/forbidden-error');
const HttpError = require('standard-http-error');

/**
 * Test `ForbiddenError`.
 */

describe('ForbiddenError', () => {
  it('should inherit from `HttpError`', () => {
    const error = new ForbiddenError();

    expect(error).toBeInstanceOf(HttpError);
  });

  it('should have default `code`', () => {
    const error = new ForbiddenError();

    expect(error.code).toBe(403);
  });

  it('should have default `message`', () => {
    const error = new ForbiddenError();

    expect(error.message).toBe('Permission Denied');
  });

  it('should accept `properties`', () => {
    const error = new ForbiddenError({ foo: 'bar' });

    expect(error.foo).toBe('bar');
  });
});
