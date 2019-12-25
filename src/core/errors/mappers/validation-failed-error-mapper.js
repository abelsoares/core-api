'use strict';

/**
 * Module dependencies.
 */

const ValidationFailedError = require('src/core/errors/validation-failed-error');
const { isEmpty, snakeCase, zipObjectDeep } = require('lodash');

/**
 * Export `ValidationFailedErrorMapper`.
 */

module.exports.map = error => {
  if (!(error instanceof ValidationFailedError)) {
    return;
  }

  const errors = error.errors.map(error => {
    // Mapping complex data path.
    if (!isEmpty(error.dataPath)) {
      const arrayMatch = error.dataPath.match(/\[(\d+)\]/);

      // Array validation.
      if (arrayMatch) {
        return { array: { [arrayMatch[1]]: error.keyword } };
      }

      return zipObjectDeep([error.dataPath.substr(1)], [error.keyword]);
    }

    // Mapping when additional properties are not allowed.
    if (error.params.additionalProperty) {
      return { [error.params.additionalProperty]: error.keyword };
    }

    // Mapping when a property is missing.
    if (error.params.missingProperty) {
      return { [error.params.missingProperty]: error.keyword };
    }

    // Return a default result.
    return { reason: error.keyword };
  });

  return {
    body: {
      code: snakeCase(error.message),
      errors
    },
    status: error.code
  };
};
