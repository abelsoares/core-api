'use strict';

/**
 * Module dependencies.
 */

const knex = require('src/core/clients/knex');

/**
 * Export `run`.
 */

module.exports = {
  async run() {
    // Drop schema.
    await knex.raw('DROP SCHEMA IF EXISTS core CASCADE');

    // Drop migrations table.
    await knex.schema.dropTableIfExists('knex_migrations');
    await knex.schema.dropTableIfExists('knex_migrations_lock');

    // Run migrations.
    await knex.migrate.latest();
  }
};
