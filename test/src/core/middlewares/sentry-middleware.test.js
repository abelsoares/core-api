'use strict';

/**
 * Module dependencies.
 */

const ConflictError = require('src/core/errors/conflict-error');
const errorMapper = require('koa-error-mapper');
const Koa = require('koa');
const sentry = require('src/core/logging/sentry');
const sentryMiddleware = require('src/core/middlewares/sentry-middleware');
const supertest = require('test/utils/request')();

/**
 * Test `SentryMiddleware`.
 */

describe('SentryMiddleware', () => {
  it('should capture any non-error thrown on application', async () => {
    jest.spyOn(sentry, 'captureException');

    const app = new Koa();

    sentryMiddleware(app);

    app.use(() => {
      /* eslint-disable no-throw-literal */
      throw 'foobar';
      /* eslint-enable no-throw-literal */
    });

    await supertest(app.callback())
      .get('/')
      .expect(500);

    expect(sentry.captureException).toHaveBeenCalledTimes(1);
    expect(sentry.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(sentry.captureException.mock.calls[0][1].logger).toBe('sentry-middleware');
    expect(sentry.captureException.mock.calls[0][1].tags.script).toBe('node_modules/.bin/jest');
    expect(sentry.captureException.mock.calls[0][1].extra).toHaveProperty('request');
  });

  it('should capture any 5xx error emitted on application', async () => {
    jest.spyOn(sentry, 'captureException');

    const app = new Koa();

    sentryMiddleware(app);

    app.use(() => {
      const error = new Error();

      error.status = 503;

      throw error;
    });

    await supertest(app.callback())
      .get('/')
      .expect(503);

    expect(sentry.captureException).toHaveBeenCalledTimes(1);
    expect(sentry.captureException.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(sentry.captureException.mock.calls[0][1].logger).toBe('sentry-middleware');
    expect(sentry.captureException.mock.calls[0][1].tags.script).toBe('node_modules/.bin/jest');
    expect(sentry.captureException.mock.calls[0][1].extra).toHaveProperty('request');
  });

  it('should not capture any 4xx error emitted on application', async () => {
    jest.spyOn(sentry, 'captureException');

    const app = new Koa();

    sentryMiddleware(app);

    app.use(() => {
      const error = new Error();

      error.status = 404;

      throw error;
    });

    await supertest(app.callback())
      .get('/')
      .expect(404);

    expect(sentry.captureException).not.toHaveBeenCalled();
  });

  it('should not capture any 4xx error mapped by the application', async () => {
    jest.spyOn(sentry, 'captureException');

    const app = new Koa();

    sentryMiddleware(app);

    app.use(errorMapper([{
      map: error => {
        if (['23503', '23505', '23514'].includes(error.code)) {
          return new ConflictError();
        }

        return;
      }
    }]));

    app.use(() => {
      const error = new Error();

      error.code = '23505';

      throw error;
    });

    await supertest(app.callback())
      .get('/')
      .expect(409);

    expect(sentry.captureException).not.toHaveBeenCalled();
  });
});
