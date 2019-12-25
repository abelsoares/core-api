'use strict';

/**
 * Module dependencies.
 */

const ForbiddenError = require('src/core/errors/forbidden-error');
const logger = require('src/core/logging/logger')('permission-middleware');
const { get } = require('lodash');

/**
 * Export `PermissionMiddleware`.
 */

module.exports = roles => {
  return async (context, next) => {
    const role = get(context, 'state.session.role');

    if (!roles.includes(role)) {
      logger.warn({ session: context.state.session }, 'Error accessing a protected resource');

      throw new ForbiddenError();
    }

    await next();
  };
};
