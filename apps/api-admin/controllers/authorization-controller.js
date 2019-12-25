'use strict';

/**
 * Module dependencies.
 */

const authorizationManager = require('src/core/authorization/managers/authorization-manager');
const authorize = require('src/core/middlewares/authorization-middleware');
const sessionManager = require('src/core/authorization/managers/session-manager');

/**
 * Export `AuthorizationController`.
 */

module.exports = function(app) {
  // Revoke token.
  app.post('POST /auth/revoke', '/auth/revoke', authorize, async context => {
    await sessionManager.destroy(context.state.session.id);

    context.status = 204;
  });

  // Get access token.
  app.post('POST /auth/token', '/auth/token', async context => {
    context.body = {
      data: await authorizationManager.login({ data: context.request.body })
    };
  });
};
