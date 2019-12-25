'use strict';

/**
 * Module dependencies.
 */

require('app-module-path').addPath(`${__dirname}/../../`);
require('src/core/mocks')();

const api = require('apps/api-admin/app');
const config = require('config');
const logger = require('src/core/logging/logger')('api');
const Promise = require('bluebird');

/**
 * Instances.
 */

// eslint-disable-next-line no-process-env
const { NODE_APP_INSTANCE } = process.env;
const host = config.get('server.api.listen.hostname');
const port = config.get('server.api.listen.port') + Number(NODE_APP_INSTANCE || 0);
const server = require('http-shutdown')(api().listen(port, host));

// Tell pm2 that the server is now online.
if (process.send) {
  server.once('listening', () => process.send('ready'));
}

/**
 * Promisify `server`.
 */

Promise.promisifyAll(server);

logger.info(`Listening on ${host}:${port}`);
