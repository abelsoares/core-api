'use strict';

/**
 * Module dependencies.
 */

const tokenizer = require('src/core/utils/tokenizer');

/**
 * Test `Tokenizer`.
 */

describe('Tokenizer', () => {
  describe('encode()', () => {
    it('should encode the given `data`', () => {
      expect(tokenizer.encode({ foo: 'bar' })).toBeTruthy();
    });
  });

  describe('decode()', () => {
    it('should decode the given `token`', () => {
      const token = tokenizer.encode({ foo: 'bar' });

      expect(tokenizer.decode(token)).toEqual({ foo: 'bar' });
    });
  });
});
