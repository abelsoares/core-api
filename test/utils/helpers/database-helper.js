'use strict';

/**
 * Module dependencies.
 */

const _ = require('lodash');
const Client = require('knex/lib/client');
const knex = require('src/core/clients/knex');
const queries = new Set();
const redis = require('src/core/clients/redis');

/**
 * Wrap `query` to find out which tables are being written to.
 */

Client.prototype.query = _.wrap(Client.prototype.query, function(fn) {
  if (!['insert', 'raw'].includes(arguments[2].method)) {
    return fn.apply(this, _.tail(arguments));
  }

  const query = _.get(arguments, '[2].sql.query', _.get(arguments, '[2].sql', ''));
  const matches = query.match(/"?core"?.("\w+")/);

  if (!matches) {
    return fn.apply(this, _.tail(arguments));
  }

  queries.add(matches[1].replace(/"/g, ''));

  return fn.apply(this, _.tail(arguments));
});

/**
 * Export helper methods.
 */

module.exports = {

  /**
   * Cleanup just the related test entities.
   */

  async cleanup() {
    if (!queries.size) {
      return;
    }

    for (const table of queries) {
      await knex.raw('TRUNCATE core.?? CASCADE', [table]);
    }

    queries.clear();
  },

  /**
   * Close connection.
   */

  async finish() {
    await knex.destroy();
    await redis.end();
  },

  /**
   * Flush redis.
   */

  async flushRedis() {
    await redis.flushdb();
  }

};
