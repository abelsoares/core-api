'use strict';

/**
 * Module dependencies.
 */

const fixtures = require('test/utils/fixtures');
const mailjet = require('test/utils/mocks/mailjet-mocks');
const { times } = require('lodash');

/**
 * Export fixtures.
 */

module.exports = async () => {
  times(4, mailjet.send.succeed);

  return await Promise.all([
    fixtures.loadUser({ email: 'admin@upview.io', role: 'admin', status: 'active' }),
    fixtures.loadUser({ email: 'standard@upview.io', role: 'standard', status: 'active' }),
    fixtures.loadUser({ email: 'standard-blocked@upview.io', role: 'standard', status: 'blocked' }),
    fixtures.loadUser({ email: 'standard-restricted@upview.io', role: 'standard', status: 'restricted' })
  ]);
};
