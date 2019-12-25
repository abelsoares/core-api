
/**
 * Module dependencies.
 */

const { isEmpty, isPlainObject, nth, pickBy } = require('lodash');

/**
 * Export `FilterMiddleware`.
 */

module.exports = async (context, next) => {
  if (!isPlainObject(context.query.filter)) {
    await next();

    return;
  }

  const expression = /^([A-Za-z0-9.]+)$/;
  const where = pickBy(context.query.filter, (value, field) => nth(expression.exec(field), 0));

  if (!isEmpty(where)) {
    context.requestOptions = {
      ...context.requestOptions,
      where
    };
  }

  await next();
};
