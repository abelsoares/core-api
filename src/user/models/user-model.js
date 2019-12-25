'use strict';

/**
 * Module dependencies.
 */

const AbstractModel = require('src/core/models/abstract-model');

/**
 * `UserModel`.
 */

class UserModel extends AbstractModel {

  /**
   * Constructor.
   */

  constructor() {
    super();

    this.masks = {
      admin: 'confirmedAt,createdAt,email,id,name,resetPasswordTokenAt,role,status,updatedAt'
    };
    this.name = 'user';
    this.tableName = 'Users';
    this.tableSchema = 'core';
  }

}

/**
 * Export `UserModel`.
 */

module.exports = new UserModel();
