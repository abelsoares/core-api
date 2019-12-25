'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const glob = require('glob').sync;
const logger = require('src/core/logging/logger')('nock');
const { isEmpty } = require('lodash');

/**
 * Compile whitelist regex.
 */

const responses = ['src/core/mocks/response/*.js'];
const whitelist = config.has('nock.whitelist') ? new RegExp(config.get('nock.whitelist')) : null;

/**
 * Load responses.
 */

function loadResponses(response) {
  const files = glob(response);

  if (isEmpty(files)) {
    throw new Error(`Globbing returned an empty list. Perhaps there is a typo on filename ${JSON.stringify(response)}`);
  }

  files.forEach(file => {
    if (whitelist && whitelist.test(file)) {
      logger.warn(`Ignored mocked response from ${file} because host has been whitelisted`);

      return;
    }

    require(file);

    logger.debug(`Loaded mocked response from ${file}`);
  });
}

/**
 * Export `nock`.
 */

module.exports = () => {
  if (!config.has('nock.enabled') || !config.get('nock.enabled')) {
    logger.debug('Nock is disabled');

    return;
  }

  // Dynamically require `nock` otherwise certain `http(s)` interceptors
  // and listeners will be registered just by requiring the module.
  const nock = require('nock');

  // Disable net connect.
  nock.disableNetConnect();

  logger.warn('Disabled net connections');

  // Load mocked HTTP requests and responses.
  responses.forEach(loadResponses);

  // Load HTTP request whitelist.
  if (whitelist) {
    nock.enableNetConnect(whitelist);

    logger.warn(`Enabled net connections to ${whitelist}`);
  }
};
