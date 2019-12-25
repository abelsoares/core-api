'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const logger = require('src/core/logging/logger')('sentry');
const path = require('path');
const sentry = require('raven');

/**
 * Disable console alerts from raven.
 */

sentry.disableConsoleAlerts();

/**
 * Instances.
 */

sentry.config(config.get('sentry.dsn'), {
  logger: logger.fields.component,
  tags: {
    script: path.relative(process.cwd(), process.argv[1])
  },
  ...config.get('sentry.options')
});

/**
 * Event `logged` and `error` callback.
 */

sentry.on('logged', id => logger.info({ id }, `Successfully captured the error to sentry with id ${id}`));
sentry.on('error', error => logger.error({ error }, 'An error ocurred while capturing the error to sentry'));

/**
 * Export `sentry`.
 */

module.exports = sentry;
