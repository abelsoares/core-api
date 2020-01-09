'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const logger = require('src/core/logging/logger')('redis');
const Redis = require('ioredis');

/**
 * Redis.
 */

const redis = new Redis(config.get('redis.connection'));

/**
 * Event `ready` and `error` callback.
 */

redis.on('ready', () => logger.info('Connecting to Redis database', JSON.stringify(config.get('redis.connection'))));
redis.on('error', error => logger.error({ error }, 'An error ocurred in redis'));

/**
 * Export `redis`.
 */

module.exports = redis;
