'use strict';

/**
 * Module dependencies.
 */

const bodyparser = require('koa-bodyparser');
const config = require('config');
const databaseErrorMapper = require('src/core/errors/mappers/database-error-mapper');
const errorMapper = require('koa-error-mapper');
const helmet = require('koa-helmet');
const httpErrorMapper = require('src/core/errors/mappers/http-error-mapper');
const kcors = require('kcors');
const Koa = require('koa');
const koaSimpleHealthcheck = require('koa-simple-healthcheck');
const MalformedRequestBodyError = require('src/core/errors/malformed-request-body-error');
const malformedRequestBodyErrorMapper = require('src/core/errors/mappers/malformed-request-body-error-mapper');
const qs = require('koa-qs');
const routers = require('apps/api-admin/routers');
const sentry = require('src/core/middlewares/sentry-middleware');
const validationFailedErrorMapper = require('src/core/errors/mappers/validation-failed-error-mapper');

/**
 * Export `application`.
 */

module.exports = () => {
  const app = new Koa();

  // Add support for nested objects on query string.
  qs(app);

  // Enable Sentry.
  sentry(app);

  // Enable koa simple healthcheck.
  app.use(koaSimpleHealthcheck({ path: '/v0/status' }));

  // Enable CORS.
  app.use(kcors(config.get('cors')));

  // Enable CSP.
  app.use(helmet.contentSecurityPolicy({ directives: { defaultSrc: ['"none"'] } }));

  // Enable HSTS.
  app.use(helmet.hsts({ maxAge: 31536000 }));

  // Enable X-XSS-Protection.
  app.use(helmet.xssFilter());

  // Disable content type sniffing.
  app.use(helmet.noSniff());

  // Deny framing.
  app.use(helmet.frameguard({ action: 'deny' }));

  // Error handler, the order of each mapper matters as in a chain of command.
  app.use(errorMapper([
    databaseErrorMapper,
    malformedRequestBodyErrorMapper,
    validationFailedErrorMapper,
    httpErrorMapper
  ]));

  // Add body parser.
  app.use(bodyparser({
    onerror(error, context) {
      throw new MalformedRequestBodyError({ mime: context.header['content-type'] });
    }
  }));

  // Mounting.
  app.use(routers.root.routes());

  return app;
};
