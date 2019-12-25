'use strict';

/**
 * Export custom environment variables configuration.
 */

module.exports = {
  cors: {
    credentials: 'CORS_CREDENTIALS'
  },
  database: {
    connection: {
      database: 'DATABASE_NAME',
      host: 'DATABASE_HOST',
      password: 'DATABASE_PASSWORD',
      user: 'DATABASE_USER'
    }
  },
  email: {
    key: 'EMAIL_KEY',
    paths: {
      accountConfirmation: 'EMAIL_PATHS_ACCOUNT_CONFIRMATION',
      productNotify: 'EMAIL_PATHS_PRODUCT_NOTIFY',
      resetPassword: 'EMAIL_PATHS_RESET_PASSWORD'
    },
    secret: 'EMAIL_SECRET'
  },
  nock: {
    enabled: {
      __format: 'json',
      __name: 'NOCK_ENABLED'
    },
    whitelist: 'NOCK_WHITELIST'
  },
  redis: {
    db: 'REDIS_DB',
    host: 'REDIS_HOST',
    port: 'REDIS_PORT'
  },
  router: {
    applicationBaseUrl: 'ROUTER_APPLICATION_BASE_URL'
  },
  secret: {
    token: 'SECRET_TOKEN'
  },
  sentry: {
    dsn: 'SENTRY_DSN'
  },
  server: {
    api: {
      listen: {
        hostname: 'SERVER_API_LISTEN_HOSTNAME',
        port: 'SERVER_API_LISTEN_PORT'
      }
    }
  }
};
