'use strict';

/**
 * Export `isProduction`.
 */

module.exports = {
  isProduction() {
    // eslint-disable-next-line no-process-env
    return process.env.NODE_ENV === 'production';
  }
};
