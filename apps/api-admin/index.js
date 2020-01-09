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

const host = config.get('server.apiAdmin.listen.hostname');
// eslint-disable-next-line no-process-env
const port = process.env.PORT || config.get('server.apiAdmin.listen.port');
const server = require('http-shutdown')(api().listen(port, host));

/**
 * Promisify `server`.
 */

Promise.promisifyAll(server);

logger.info(`Listening on ${host}:${port}`);
