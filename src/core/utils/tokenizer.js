'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const jwt = require('jwt-simple');

/**
 * `Tokenizer`.
 */

class Tokenizer {

  /**
   * Decode.
   */

  decode(token) {
    return jwt.decode(token, config.get('secret.token'));
  }

  /**
   * Encode.
   */

  encode(data) {
    return jwt.encode(data, config.get('secret.token'));
  }

}

/**
 * Export `Tokenizer`.
 */

module.exports = new Tokenizer();
