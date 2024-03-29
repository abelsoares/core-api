'use strict';

/**
 * Export default configuration.
 */

module.exports = {
  authorization: {
    password: {
      minLength: 6,
      saltLength: 8
    }
  },
  confirmation: {
    unit: 'hours',
    value: 12
  },
  cors: {
    credentials: true
  },
  database: {
    client: 'postgres',
    connection: {
      charset: 'utf8',
      database: 'application',
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres'
    }
  },
  email: {
    errorReportingEmail: 'abel@upview.io',
    key: 'foo',
    paths: {
      accountConfirmation: 'account/confirm',
      resetPassword: 'password/reset'
    },
    secret: 'bar'
  },
  nock: {
    enabled: false
  },
  pagination: {
    default: {
      maximum: 100,
      size: 30
    }
  },
  redis: {
    connection: {
      db: 0,
      host: 'localhost',
      port: 6379
    }
  },
  reset: {
    unit: 'hour',
    value: 1
  },
  router: {
    applicationBaseUrl: 'http://localhost:2000'
  },
  secret: {
    token: 'foobar'
  },
  sentry: {
    dsn: null,
    options: {
      release: require('../package.json').version
    }
  },
  server: {
    apiAdmin: {
      listen: {
        hostname: '0.0.0.0',
        port: 4001
      }
    }
  },
  session: {
    unit: 'days',
    value: 10
  }
};
