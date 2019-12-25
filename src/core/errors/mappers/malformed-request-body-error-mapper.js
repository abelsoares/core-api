'use strict';

/**
 * Module dependencies.
 */

const MalformedRequestBodyError = require('src/core/errors/malformed-request-body-error');
const { snakeCase } = require('lodash');

/**
 * Export `MalformedRequestBodyErrorMapper`.
 */

module.exports.map = error => {
  if (!(error instanceof MalformedRequestBodyError)) {
    return;
  }

  return {
    body: {
      code: snakeCase(error.message),
      message: error.message
    },
    status: error.status
  };
};
