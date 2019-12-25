'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const moment = require('moment');
const redis = require('src/core/clients/redis');
const tokenizer = require('src/core/utils/tokenizer');
const userManager = require('src/user/managers/user-manager');
const uuid = require('uuid/v4');
const { ajv } = require('src/core/validator');

/**
 * Exports.
 */

module.exports = {

  /**
   * Generate token.
   */

  async generateToken({ role, userId = uuid() } = {}) {
    const id = uuid();
    const { unit, value } = config.get('session');

    await redis
      .pipeline()
      .hmset(`session:${id}`, {
        role,
        userId
      })
      .expire(`session:${id}`, moment.duration(value, unit).asSeconds())
      .exec();

    return tokenizer.encode({ sessionId: id });
  },

  /**
   * Lazy load api admin app.
   */

  loadApp() {
    return require('apps/api-admin/app.js')().callback();
  },

  /**
   * Load json schema.
   */

  loadJsonSchema(schema) {
    return ajv.addSchema(schema, schema.$id);
  },

  /**
   * Load user.
   */

  async loadUser({
    email = 'foo@bar.com',
    name = 'foo',
    password = 'foobar',
    role,
    status = 'restricted'
  } = {}) {
    let user = await userManager.createUser({
      data: {
        email,
        name,
        password,
        role,
        status
      }
    });

    if (status === 'active') {
      user = await userManager.confirmUser({ user });
    }

    return user;
  }
};
