'use strict';

/**
 * Module dependencies.
 */

const config = require('config');

/**
 * Export `PaginateMiddleware`.
 */

module.exports = async (context, next) => {
  const { maximum, size } = config.get('pagination.default');
  let page = {
    number: 1,
    size
  };

  if (!context.query.page) {
    context.requestOptions = {
      ...context.requestOptions,
      page
    };

    await next();

    return;
  }

  let { number, size: pageSize } = context.query.page;

  if (number) {
    number = parseInt(number, 10);

    if (!isNaN(number) && number > 0) {
      page = {
        ...page,
        number
      };
    }
  }

  if (pageSize) {
    pageSize = parseInt(pageSize, 10);

    if (!isNaN(pageSize) && pageSize > 0 && pageSize <= maximum) {
      page = {
        ...page,
        size: pageSize
      };
    }
  }

  context.requestOptions = {
    ...context.requestOptions,
    page
  };

  await next();
};
