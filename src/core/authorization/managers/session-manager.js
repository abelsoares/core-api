'use strict';

/**
 * Module dependencies.
 */

const redis = require('src/core/clients/redis');

/**
 * `SessionManager`.
 */

class SessionManager {

  /**
   * Create.
   */

  create(id, duration, data) {
    return redis
      .pipeline()
      .hmset(`session:${id}`, data)
      .expire(`session:${id}`, duration)
      .exec();
  }

  /**
   * Destroy.
   */

  destroy(id) {
    return redis.del(`session:${id}`);
  }

  /**
   * Expire.
   */

  expire(id, duration) {
    return redis.expire(`session:${id}`, duration);
  }

  /**
   * Get.
   */

  get(id) {
    return redis.hgetall(`session:${id}`);
  }

}

/**
 * Export `SessionManager`.
 */

module.exports = new SessionManager();
