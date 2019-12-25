'use strict';

/**
 * Module dependencies.
 */

const _ = require('lodash');
const knex = require('src/core/clients/knex');

/**
 * Export `AbstractModel`.
 */

module.exports = class AbstractModel {

  /**
   * Constructor.
   */

  constructor() {
    this.knex = knex;
  }

  /**
   * Get mask.
   */

  getMask({ scope }) {
    return _.get(this.masks, scope, _.get(this.masks, 'public', ''));
  }

};
