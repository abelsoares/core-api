'use strict';

/**
 * Module dependencies.
 */

const Ajv = require('ajv');
const ajvKeywords = require('ajv-keywords');
const ValidationFailedError = require('src/core/errors/validation-failed-error');
const { has, isString, pick } = require('lodash');

/**
 * Instances.
 */

const ajv = new Ajv({
  allErrors: true,
  format: 'full',
  schemas: [
    require('src/core/schemas/empty-object-schema'),
    require('src/core/schemas/numeric-string-schema'),
    require('src/user/schemas/user-create-schema'),
    require('src/user/schemas/user-login-schema'),
    require('src/user/schemas/user-schema')
  ]
});

/**
 * Extend ajv with keywords.
 */

ajvKeywords(ajv, ['regexp', 'typeof']);

/**
 * Export `validate`.
 */

module.exports = {
  ajv,
  validate: (payload, schema) => {
    if (ajv.validate(schema, payload)) {
      const object = isString(schema) ? ajv.getSchema(schema) : { schema };

      return has(object, 'schema.properties') ? pick(payload, Object.keys(object.schema.properties)) : payload;
    }

    throw new ValidationFailedError(ajv.errors);
  }
};
