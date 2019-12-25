'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');

/**
 * `ForbiddenError`.
 */

class ForbiddenError extends HttpError {

  /**
   * Constructor.
   */

  constructor(properties) {
    super(403, 'Permission Denied', properties);
  }

}

/**
 * Export `ForbiddenError`.
 */

module.exports = ForbiddenError;
