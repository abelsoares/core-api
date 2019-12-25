'use strict';

/**
 * Module dependencies.
 */

const userManager = require('src/user/managers/user-manager');
const users = require('fixtures/1/users');
const { map, uniq } = require('lodash');

/**
 * Test `Users`.
 */

describe('Users', () => {
  it('should load all users', async () => {
    await users();

    const loadedUsers = await userManager.find();

    expect(loadedUsers.length).toBe(4);
    expect(map(loadedUsers, 'email').sort()).toEqual([
      'admin@upview.io',
      'standard-blocked@upview.io',
      'standard-restricted@upview.io',
      'standard@upview.io'
    ]);
    expect(uniq(map(loadedUsers, 'role')).sort()).toEqual(['admin', 'standard']);
    expect(uniq(map(loadedUsers, 'status')).sort()).toEqual(['active', 'blocked', 'restricted']);
  });
});
