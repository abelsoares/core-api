'use strict';

/**
 * Module dependencies.
 */

const ConflictError = require('src/core/errors/conflict-error');
const ValidationFailedError = require('src/core/errors/validation-failed-error');

/**
 * Export `DatabaseErrorMapper`.
 */

module.exports.map = error => {
  // Not null constraint.
  if (error.code === '23502') {
    throw new ValidationFailedError({ dataPath: `.${error.column}`, keyword: 'required' });
  }

  // Return `ConflictError` on foreign key, unique constraint and check constraint violation.
  if (['23503', '23505', '23514', '42703'].includes(error.code)) {
    return new ConflictError();
  }

  return;
};
