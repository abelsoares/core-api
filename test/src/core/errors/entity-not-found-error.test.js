'use strict';

/**
 * Module dependencies.
 */

const EntityNotFoundError = require('src/core/errors/entity-not-found-error');
const HttpError = require('standard-http-error');

/**
 * Test `EntityNotFoundError`.
 */

describe('EntityNotFoundError', () => {
  it('should inherit from `HttpError`', () => {
    const error = new EntityNotFoundError();

    expect(error).toBeInstanceOf(HttpError);
  });

  it('should have default `code`', () => {
    const error = new EntityNotFoundError();

    expect(error.code).toBe(404);
  });

  it('should accept `message` and `properties`', () => {
    const error = new EntityNotFoundError('foo', { foo: 'bar' });

    expect(error.message).toBe('foo');
    expect(error.foo).toBe('bar');
  });
});
