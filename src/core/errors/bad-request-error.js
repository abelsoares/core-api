'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');

/**
 * `BadRequestError`.
 */

class BadRequestError extends HttpError {

  /**
   * Constructor.
   */

  constructor(message = 'Bad Request', properties) {
    super(400, message, properties);
  }

}

/**
 * Export `BadRequestError`.
 */

module.exports = BadRequestError;
