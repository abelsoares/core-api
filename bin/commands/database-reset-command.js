#!/usr/bin/env node

'use strict';

require('app-module-path').addPath(`${__dirname}/../../`);

/**
 * Module dependencies.
 */

const program = require('commander');
const { isProduction } = require('src/core/utils/environment');
const { run } = require('src/commands/database-reset-command');

/**
 * Exit process.
 */

const { exit } = process;

/**
 * Command-line program definition.
 */

program.description('Reset the database');

/**
 * Command-line coroutine.
 */

(async () => {
  if (isProduction()) {
    throw new Error('Refusing to reset production database');
  }

  await run();

  exit();
})();
