'use strict';

/**
 * Module dependencies.
 */

const _ = require('lodash');

/**
 * Add mask expectation.
 */

expect.extend({
  toBeMaskedInstanceWithScope(received, instance, scope) {
    let mask;

    try {
      mask = require(`../masks/${_.kebabCase(instance)}-mask`);
    } catch (e) {
      return {
        message: () => `could not find ${instance} mask`,
        pass: false
      };
    }

    mask[scope].call(this, received);

    return {
      message: () => `expected object not to be ${instance} with scope ${scope}`,
      pass: true
    };
  }
});
