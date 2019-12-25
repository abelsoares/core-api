'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const mailjet = require('node-mailjet').connect(config.get('email.key'), config.get('email.secret'));

/**
 * Export `mailjet`.
 */

module.exports = mailjet;
