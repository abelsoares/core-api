'use strict';

/**
 * Module dependencies.
 */

const Promise = require('bluebird');
const { hash } = require('bcrypt');

/**
 * Promisify crypto.
 */

const crypto = Promise.promisifyAll(require('crypto'));

/**
 * Export `crypto`.
 */

module.exports = {
  async generateToken({ size }) {
    const bytes = await crypto.randomBytesAsync(size);

    return bytes.toString('hex');
  },

  async hash({ data, salt }) {
    return await hash(data, salt);
  }
};
