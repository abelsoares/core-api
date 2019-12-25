'use strict';

/**
 * Module dependencies.
 */

const config = require('config');

/**
 * Export `knexfile`.
 */

exports.development = exports.production = exports.test = config.get('database');
