'use strict';

/**
 * Module dependencies.
 */

const BadRequestError = require('src/core/errors/bad-request-error');
const HttpError = require('standard-http-error');

/**
 * Test `BadRequestError`.
 */

describe('BadRequestError', () => {
  it('should inherit from `HttpError`', () => {
    const error = new BadRequestError();

    expect(error).toBeInstanceOf(HttpError);
  });

  it('should have default `code`', () => {
    const error = new BadRequestError();

    expect(error.code).toBe(400);
  });

  it('should have default `message`', () => {
    const error = new BadRequestError();

    expect(error.message).toBe('Bad Request');
  });

  it('should accept `message` and `properties`', () => {
    const error = new BadRequestError('foo', { foo: 'bar' });

    expect(error.message).toBe('foo');
    expect(error.foo).toBe('bar');
  });
});
