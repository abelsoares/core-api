'use strict';

/**
 * Module dependencies.
 */

const logger = require('src/core/logging/logger')('populate');
const requireDir = require('require-dir');
const { camelCase } = require('lodash');
const { run: databaseReset } = require('src/commands/database-reset-command');

/**
 * Files.
 */

const data = requireDir('../../fixtures', { recurse: true });

/**
 * Export `run`.
 */

module.exports = {
  async run() {
    await databaseReset();

    const container = {};

    for (const type in data) {
      for (const item in data[type]) {
        logger.debug(`Loading ${type} > ${item}`);

        container[camelCase(item)] = await data[type][item](container);
      }
    }
  }
};
