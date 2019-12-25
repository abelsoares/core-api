'use strict';

/**
 * Module dependencies.
 */

const ValidationFailedError = require('src/core/errors/validation-failed-error');
const { map } = require('src/core/errors/mappers/validation-failed-error-mapper');

/**
 * Test `ValidationFailedErrorMapper`.
 */

describe('ValidationFailedErrorMapper', () => {
  it('should return nothing if the `error` is not an instance of `ValidationFailedError`', () => {
    expect(map(new Error())).toBeUndefined();
  });

  it('should map `ValidationFailedError` errors', () => {
    const errors = [
      { dataPath: '.id', keyword: 'format', params: { format: 'uuid' } },
      { dataPath: '.name', keyword: 'type', params: { type: 'string' } },
      { dataPath: '', keyword: 'additionalProperties', params: { additionalProperty: 'foo' } },
      { dataPath: '', keyword: 'foo', params: { type: 'string' } },
      { dataPath: '', keyword: 'required', params: { missingProperty: 'updatedAt' } },
      { dataPath: '[0]', keyword: 'type', params: { type: 'string' } }
    ];
    const error = new ValidationFailedError(errors);

    expect(map(error)).toEqual({
      body: {
        code: 'validation_failed',
        errors: [
          { id: 'format' },
          { name: 'type' },
          { foo: 'additionalProperties' },
          { reason: 'foo' },
          { updatedAt: 'required' },
          { array: { 0: 'type' } }
        ]
      },
      status: error.code
    });
  });
});
