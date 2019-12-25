'use strict';

/**
 * Module dependencies.
 */

const ConflictError = require('src/core/errors/conflict-error');
const ValidationFailedError = require('src/core/errors/validation-failed-error');
const { assign } = require('lodash');
const { map } = require('src/core/errors/mappers/database-error-mapper');

/**
 * Test `DatabaseErrorMapper`.
 */

describe('DatabaseErrorMapper', () => {
  it('should return nothing if the `error` is not a recognized code', () => {
    expect(map(new Error())).toBeUndefined();
  });

  it('should return an `ValidationFailedError` in case a postgres not null violation is thrown', () => {
    const error = assign(new Error(), { code: '23502', column: 'name' });

    try {
      map(error);

      fail();
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationFailedError);
      expect(e.errors).toEqual([{ dataPath: '.name', keyword: 'required' }]);
    }
  });

  ['23503', '23505', '23514', '42703'].forEach(code => {
    it(`should return a \`ConflictError\` in case postgres throws an error with code \`${code}\``, () => {
      const mapped = map({ code });

      expect(mapped).toBeInstanceOf(ConflictError);
    });
  });
});
