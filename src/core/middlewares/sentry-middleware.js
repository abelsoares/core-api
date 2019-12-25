'use strict';

/**
 * Module dependencies.
 */

const logger = require('src/core/logging/logger')('sentry-middleware');
const path = require('path');
const sentry = require('src/core/logging/sentry');
const { omit } = require('lodash');

/**
 * Export `SentryMiddleware`.
 */

module.exports = app => {
  app.on('error', (error, context) => {
    // If node threw an error we map to `error.status`, if it has `error.code` on the root then it's from postgres and we validate the response.
    if (error.status < 500 || error.code && context.response.status < 500) {
      logger.warn({ error: omit(error, 'message') }, error.message);

      return;
    }

    // The parse request method normalizes the data.
    const { request } = sentry.parsers.parseRequest(context.request);

    logger.error({ error }, 'Capturing error to sentry');

    return sentry.captureException(error, {
      extra: {
        request
      },
      logger: logger.fields.component,
      tags: {
        script: path.relative(process.cwd(), process.argv[1])
      }
    });
  });

  return app;
};
