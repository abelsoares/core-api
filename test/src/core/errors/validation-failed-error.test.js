'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');
const ValidationFailedError = require('src/core/errors/validation-failed-error');

/**
 * Test `ValidationFailedError`.
 */

describe('ValidationFailedError', () => {
  describe('validate()', () => {
    it('should inherit from `HttpError`', () => {
      const error = new ValidationFailedError();

      expect(error).toBeInstanceOf(HttpError);
    });

    it('should have default `code` and `message`', () => {
      const error = new ValidationFailedError();

      expect(error.code).toBe(400);
      expect(error.message).toBe('Validation Failed');
    });

    it('should accept errors', () => {
      const error = new ValidationFailedError([{ foo: 'bar' }, { qux: 'biz', schemaPath: 'lar' }]);

      expect(error.errors).toEqual([{ foo: 'bar' }, { qux: 'biz' }]);
    });

    it('should accept a single error', () => {
      const error = new ValidationFailedError({ foo: 'bar' });

      expect(error.errors).toEqual([{ foo: 'bar' }]);
    });
  });
});
