'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');

/**
 * `MalformedRequestBodyError`.
 */

class MalformedRequestBodyError extends HttpError {

  /**
   * Constructor.
   */

  constructor(properties) {
    super(400, 'Malformed Request Body', properties);
  }

}

/**
 * Export `MalformedRequestBodyError`.
 */

module.exports = MalformedRequestBodyError;
