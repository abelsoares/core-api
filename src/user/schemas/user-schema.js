'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const roles = require('src/user/enums/role-enum');
const statuses = require('src/user/enums/status-enum');

/**
 * Export schema.
 */

module.exports = {
  $id: 'user',
  additionalProperties: false,
  properties: {
    confirmedAt: {
      format: 'date-time',
      type: 'string'
    },
    email: {
      format: 'email',
      type: 'string'
    },
    name: {
      type: 'string'
    },
    password: {
      minLength: config.get('authorization.password.minLength'),
      type: 'string'
    },
    resetPasswordTokenAt: {
      anyOf: [{
        format: 'date-time',
        type: 'string'
      }, {
        type: 'null'
      }]
    },
    role: {
      enum: roles,
      type: 'string'
    },
    status: {
      enum: statuses,
      type: 'string'
    }
  },
  type: 'object'
};
