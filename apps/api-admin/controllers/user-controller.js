'use strict';

/**
 * Module dependencies.
 */

const authorize = require('src/core/middlewares/authorization-middleware');
const EntityNotFoundError = require('src/core/errors/entity-not-found-error');
const filter = require('src/core/middlewares/filter-middleware');
const ForbiddenError = require('src/core/errors/forbidden-error');
const paginate = require('src/core/middlewares/paginate-middleware');
const permissionMiddleware = require('src/core/middlewares/permission-middleware');
const redis = require('src/core/clients/redis');
const sessionManager = require('src/core/authorization/managers/session-manager');
const userManager = require('src/user/managers/user-manager');
const { validate } = require('src/core/validator');

/**
 * Permission.
 */

const permission = permissionMiddleware(['admin']);

/**
 * Export `UserController`.
 */

module.exports = app => {
  // Get users.
  app.get('GET /users', '/users', authorize, permission, filter, paginate, async context => {
    const { data, total } = await userManager.search(context.requestOptions);

    context.body = {
      data: userManager.mask({ data, scope: 'admin' }),
      total
    };
  });

  // Get authenticated user.
  app.get('GET /users/me', '/users/me', authorize, permission, async context => {
    const data = await userManager.findOne({ where: { id: context.state.session.userId } });

    context.body = {
      data: userManager.mask({ data, scope: 'admin' })
    };
  });

  // Get user.
  app.get('GET /users/:id', '/users/:id', authorize, permission, async context => {
    const data = await userManager.findOne({ where: { id: context.params.id } });

    context.body = {
      data: userManager.mask({ data, scope: 'admin' })
    };
  });

  // Create user.
  app.post('POST /users', '/users', authorize, permission, async context => {
    const user = await userManager.createUser({ data: context.request.body });

    context.body = {
      data: userManager.mask({ data: user, scope: 'admin' })
    };
  });

  // Change password.
  app.post('POST /users/password/change', '/users/password/change', authorize, async context => {
    const user = await userManager.findOne({ where: { id: context.state.session.userId } });

    await userManager.changePassword({ data: context.request.body, user });
    await sessionManager.destroy(context.state.session.id);

    context.status = 204;
  });

  // Forgot password.
  app.post('POST /users/password/forgot', '/users/password/forgot', async context => {
    const { email } = validate(context.request.body, { properties: { email: { $ref: 'user#/properties/email' } }, required: ['email'], type: 'object' });

    context.status = 204;

    let user;

    try {
      user = await userManager.findOne({ where: { email } });
    } catch (e) {
      if (!(e instanceof EntityNotFoundError)) {
        throw e;
      }

      return;
    }

    await userManager.forgotPassword({ user });
  });

  // Reset password.
  app.post('POST /users/password/reset', '/users/password/reset', async context => {
    if (!context.query.token) {
      throw new ForbiddenError();
    }

    const { password } = validate(context.request.body, 'user-create');
    const id = await redis.get(`reset:${context.query.token}`);
    const user = await userManager.findOne({ where: { id } });

    await userManager.resetPassword({ password, user });

    context.status = 204;
  });

  // Update a user.
  app.patch('PATCH /users/:id', '/users/:id', authorize, permission, async context => {
    validate(context.request.body, { properties: { password: { not: {} }, status: { not: {} } } });

    const updated = await userManager.updateUser({ data: context.request.body, where: { id: context.params.id } });

    context.body = {
      data: userManager.mask({ data: updated, scope: 'admin' })
    };
  });

  // Delete a user.
  app.delete('DELETE /users/:id', '/users/:id', authorize, permission, async context => {
    await userManager.delete({ where: { id: context.params.id } });

    context.status = 204;
  });
};
