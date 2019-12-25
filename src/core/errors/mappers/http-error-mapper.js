'use strict';

/**
 * Module dependencies.
 */

const HttpError = require('standard-http-error');
const statusCodes = require('http').STATUS_CODES;
const { snakeCase } = require('lodash');

/**
 * Export `HttpErrorMapper`.
 */

module.exports.map = error => {
  if (!(error instanceof HttpError)) {
    return;
  }

  return {
    body: {
      code: snakeCase(statusCodes[error.code]),
      message: statusCodes[error.code]
    },
    headers: error.headers,
    status: error.code
  };
};
