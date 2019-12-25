'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');

/**
 * `UnauthorizedError`.
 */

class UnauthorizedError extends HttpError {

  /**
   * Constructor.
   */

  constructor(properties) {
    super(401, 'Bad Credentials', properties);
  }

}

/**
 * Export `UnauthorizedError`.
 */

module.exports = UnauthorizedError;
