'use strict';

/**
 * Module dependencies.
 */

const authHeader = require('auth-header');
const config = require('config');
const moment = require('moment');
const sessionManager = require('src/core/authorization/managers/session-manager');
const tokenizer = require('src/core/utils/tokenizer');
const UnauthorizedError = require('src/core/errors/unauthorized-error');

/**
 * Export `AuthorizationMiddleware`.
 */

module.exports = async (context, next) => {
  const { unit, value } = config.get('session');
  const authorization = context.get('Authorization');
  let data;

  if (!/Bearer\s(\S+)/.test(authorization)) {
    throw new UnauthorizedError();
  }

  try {
    const { token } = authHeader.parse(authorization);

    data = tokenizer.decode(token);
  } catch (e) {
    throw new UnauthorizedError();
  }

  const { userId, role } = await sessionManager.get(data.sessionId);

  if (!userId) {
    throw new UnauthorizedError();
  }

  // Extend session expiration date.
  await sessionManager.expire(data.sessionId, moment.duration(value, unit).asSeconds());

  context.state.session = {
    id: data.sessionId,
    role,
    userId
  };

  await next();
};
