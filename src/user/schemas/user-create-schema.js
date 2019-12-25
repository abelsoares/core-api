'use strict';

/**
 * Export schema.
 */

module.exports = {
  $id: 'user-create',
  allOf: [{
    $ref: 'user'
  }, {
    required: [
      'password'
    ]
  }]
};
