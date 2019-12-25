'use strict';

/**
 * Module dependencies.
 */

const Router = require('koa-router');
const { ajv } = require('src/core/validator');

// Routers.
const root = new Router({ prefix: '/v0' });

// Validate `id`.
root.param('id', async (id, context, next) => {
  if (!ajv.validate({ format: 'uuid', type: 'string' }, id)) {
    return;
  }

  await next();
});

// Controllers.
require('apps/api-admin/controllers/authorization-controller')(root);
require('apps/api-admin/controllers/user-controller')(root);

/**
 * Export `routers`.
 */

module.exports = { root };
