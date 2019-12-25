'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');

/**
 * `EntityNotFoundError`.
 */

class EntityNotFoundError extends HttpError {

  /**
   * Constructor.
   */

  constructor(message, properties) {
    super(404, message, properties);
  }

}

/**
 * Export `EntityNotFoundError`.
 */

module.exports = EntityNotFoundError;
