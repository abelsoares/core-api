'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');
const { omit } = require('lodash');

/**
 * `ValidationFailedError`.
 */

class ValidationFailedError extends HttpError {

  /**
   * Constructor.
   */

  constructor(errors = []) {
    const allErrors = Array.isArray(errors) ? errors : [errors];

    super(400, 'Validation Failed', { errors: allErrors.map(error => omit(error, ['schemaPath'])) });
  }

}

/**
 * Export `ValidationFailedError`.
 */

module.exports = ValidationFailedError;
