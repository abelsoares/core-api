'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');

/**
 * `InvalidArgumentError`.
 */

class InvalidArgumentError extends HttpError {

  /**
   * Constructor.
   */

  constructor(message, properties) {
    super(500, message, properties);
  }

}

/**
 * Export `InvalidArgumentError`.
 */

module.exports = InvalidArgumentError;
