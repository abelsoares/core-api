'use strict';

/**
 * Module dependencies.
 */

const nock = require('nock');

/**
 * Add `nock` hook.
 */

nock.disableNetConnect();
nock.enableNetConnect('(127.0.0.1|localhost)');

afterEach(() => {
  const pendingMocks = nock.pendingMocks();

  nock.cleanAll();

  if (pendingMocks.length) {
    throw new Error(`Unexpected pending mocks ${JSON.stringify(pendingMocks)}`);
  }
});
