'use strict';

/**
 * Module dependencies.
 */

const debugnyan = require('debugnyan');

/**
 * Export `Logger`.
 */

module.exports = namespace => Object.create(debugnyan(`core-api:${namespace}`));
