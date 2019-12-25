'use strict';

/**
 * Module dependencies.
 */

const helper = require('test/utils/helpers/database-helper');
const { run } = require('src/commands/database-reset-command');

/**
 * Add `beforeAll` hook.
 */

beforeAll(async () => {
  await run();
  await helper.cleanup();
});

/**
 * Add `afterAll` hook.
 */

afterAll(async () => {
  await helper.finish();
});

/**
 * Add `afterEach` hook.
 */

afterEach(async () => {
  await helper.cleanup();
});
