'use strict';

/**
 * Module dependencies.
 */

const AbstractManager = require('src/core/managers/abstract-manager');
const bcrypt = require('bcrypt');
const config = require('config');
const moment = require('moment');
const sessionManager = require('src/core/authorization/managers/session-manager');
const tokenizer = require('src/core/utils/tokenizer');
const UnauthorizedError = require('src/core/errors/unauthorized-error');
const UserModel = require('src/user/models/user-model');
const uuid = require('uuid/v4');
const { validate } = require('src/core/validator');

/**
 * `AuthorizationManager`.
 */

class AuthorizationManager extends AbstractManager {

  /**
   * Login.
   */

  async login({ data }) {
    validate(data, 'user-login');

    const { unit, value } = config.get('session');
    const [user] = await this.query()
      .where({ email: data.email })
      .whereNot({ status: 'blocked' });

    if (!user) {
      throw new UnauthorizedError();
    }

    const authorized = await bcrypt.compare(data.password, user.password);

    if (!authorized) {
      throw new UnauthorizedError();
    }

    const sessionId = uuid();

    await sessionManager.create(sessionId, moment.duration(value, unit).asSeconds(), {
      role: user.role,
      userId: user.id
    });

    return {
      role: user.role,
      token: tokenizer.encode({ sessionId })
    };
  }

}

/**
 * Export `AuthorizationManager`.
 */

module.exports = new AuthorizationManager(UserModel);
