'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const knex = require('knex');
const logger = require('src/core/logging/logger')('database');

// Database configuration.
const configuration = config.get('database');

// Log connection.
logger.info('Connecting to database', JSON.stringify(configuration));

/**
 * Export `knex`.
 */

module.exports = knex(configuration);
