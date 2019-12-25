'use strict';

/**
 * Export schema.
 */

module.exports = {
  $id: 'user-login',
  allOf: [{
    $ref: 'user'
  }, {
    required: [
      'email',
      'password'
    ]
  }]
};
