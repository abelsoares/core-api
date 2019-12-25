'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');

/**
 * `ConflictError`.
 */

class ConflictError extends HttpError {

  /**
   * Constructor.
   */

  constructor(message, properties) {
    super(409, message, properties);
  }

}

/**
 * Export `ConflictError`.
 */

module.exports = ConflictError;
