'use strict';

/**
 * Module dependencies.
 */

const redis = require('src/core/clients/redis');
const sessionManager = require('src/core/authorization/managers/session-manager');
const { flushRedis } = require('test/utils/helpers/database-helper');

/**
 * Test `SessionManager`.
 */

describe('SessionManager', () => {
  afterEach(async () => {
    await flushRedis();
  });

  describe('create()', () => {
    it('should create a session with given `id`, `duration` and `data`', async () => {
      await sessionManager.create('foobar', 1, { biz: 'baz' });

      const data = await redis.hgetall('session:foobar');

      expect(data).toEqual({ biz: 'baz' });
    });
  });

  describe('destroy()', () => {
    it('should destroy the session with given `id`', async () => {
      await redis.hmset('session:foobar', { qux: 'qix' });

      await sessionManager.destroy('foobar');

      const session = await redis.hgetall('session:foobar');

      expect(session).toEqual({});
    });
  });

  describe('expire()', () => {
    it('should expire the session with given `id` and `duration`', async () => {
      await redis.hmset(`session:foobar`, { biz: 'baz', qux: 'qix' });
      await sessionManager.expire('foobar', 1);

      const timeToLive = await redis.ttl('session:foobar');

      expect(timeToLive).toBeTruthy();
    });
  });

  describe('get()', () => {
    it('should return empty object if there is no session with given `id`', async () => {
      const session = await sessionManager.get('foobar');

      expect(session).toEqual({});
    });

    it('should return the data of the session with given `id`', async () => {
      await redis.hmset('session:foobar', { qux: 'qix' });

      const session = await sessionManager.get('foobar');

      expect(session).toEqual({ qux: 'qix' });
    });
  });
});
