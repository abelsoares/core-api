'use strict';

/**
 * Module dependencies.
 */

const _ = require('lodash');
const http = require('http');
const { join } = require('path');
const { Test } = require('supertest');

/**
 * Export `Request`.
 */

module.exports = prefix => {
  return app => {
    if (_.isFunction(app)) {
      app = http.createServer(app);
    }

    const obj = {};

    http.METHODS
      .map(method => method.toLowerCase())
      .forEach(method => {
        obj[method] = url => new Test(app, method, join(prefix || '/', url));
      });

    // Support previous use of del.
    obj.del = obj.delete;

    return obj;
  };
};
