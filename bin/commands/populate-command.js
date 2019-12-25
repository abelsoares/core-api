#!/usr/bin/env node

'use strict';

require('app-module-path').addPath(`${__dirname}/../../`);
require('src/core/mocks')();

/**
 * Module dependencies.
 */

const program = require('commander');
const { isProduction } = require('src/core/utils/environment');
const { run } = require('src/commands/populate-command');

/**
 * Exit process.
 */

const { exit } = process;

/**
 * Command-line program definition.
 */

program.description('Populate the database');

/**
 * Command-line coroutine.
 */

(async () => {
  if (isProduction()) {
    throw new Error('Refusing to populate production database');
  }

  await run();

  exit();
})();
