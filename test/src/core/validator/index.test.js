'use strict';

/**
 * Module dependencies.
 */

const ValidationFailedError = require('src/core/errors/validation-failed-error');
const { validate } = require('src/core/validator');

/**
 * Test `Validator`.
 */

describe('Validator', () => {
  it('should return the object when evaluating keywords', () => {
    expect(validate(/.*/, { instanceof: 'RegExp' })).toEqual(/.*/);
  });

  it('should return the object filtered of keys not present in `schema`', () => {
    expect(validate({ biz: 'qux', foo: 'bar' }, { properties: { foo: { minLength: 3 } } })).toEqual({ foo: 'bar' });
  });

  it('should throw a `ValidationFailedError` if validation fails', () => {
    try {
      validate({ foo: 'bar', qux: 'biz' }, { properties: { foo: { minLength: 4 }, qux: { type: 'object' } } });

      fail();
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationFailedError);
    }
  });

  describe('numeric-string', () => {
    ['-999999', '-1', '.01', '9999999', '9999999.99'].forEach(value => {
      it(`should throw a \`ValidationFailedError\` evaluating \`${value}\``, () => {
        try {
          validate(value, 'numeric-string');

          fail();
        } catch (e) {
          expect(e).toBeInstanceOf(ValidationFailedError);
        }
      });
    });

    ['0.01', '0.01', '1', '999999', '999999.99'].forEach(value => {
      it(`should not throw a \`ValidationFailedError\` evaluating \`${value}\``, () => {
        validate(value, 'numeric-string');
      });
    });
  });
});
