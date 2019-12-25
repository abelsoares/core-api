'use strict';

/**
 * Module dependencies.
 */

const { compact } = require('lodash');

/**
 * Instances.
 */

const expression = new RegExp('^(-)?([A-Za-z0-9_-]+)$');

/**
 * Export `SortMiddleware`.
 */

module.exports = async (context, next) => {
  if (!context.query.sort) {
    await next();

    return;
  }

  const sort = compact(context.query.sort.split(',')
    .map(field => {
      const match = expression.exec(field);

      if (!match) {
        return;
      }

      return {
        direction: match[1] ? 'desc' : 'asc',
        field: match[2]
      };
    }));

  context.requestOptions = {
    ...context.requestOptions,
    sort
  };

  await next();
};
