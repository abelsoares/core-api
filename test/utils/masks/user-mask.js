'use strict';

/**
 * Module dependencies.
 */

const roles = require('src/user/enums/role-enum');
const statuses = require('src/user/enums/status-enum');
const { difference, pickBy } = require('lodash');

/**
 * Export `User` mask.
 */

module.exports = {
  admin(instance) {
    const required = ['createdAt', 'email', 'id', 'name', 'role', 'status', 'updatedAt'];
    const optional = ['confirmedAt', 'resetPasswordTokenAt'];

    expect(difference(Object.keys(pickBy(instance)), optional)).toEqual(required);
    expect(statuses).toContain(instance.status);
    expect(roles).toContain(instance.role);
    expect(typeof instance.createdAt).toBe('string');
    expect(typeof instance.email).toBe('string');
    expect(typeof instance.id).toBe('string');
    expect(typeof instance.name).toBe('string');
    expect(typeof instance.updatedAt).toBe('string');

    if (instance.confirmedAt) {
      expect(typeof instance.confirmedAt).toBe('string');
    }

    if (instance.resetPasswordTokenAt) {
      expect(typeof instance.resetPasswordTokenAt).toBe('string');
    }
  }
};
