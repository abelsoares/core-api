'use strict';

/**
 * Module dependencies.
 */

const fixtures = require('test/utils/fixtures');
const router = require('apps/api-admin/routers').root;
const supertest = require('test/utils/request')('/v0');

/**
 * Test `Api`.
 */

describe('Api', () => {
  const request = supertest(fixtures.loadApp());

  describe('Parameter validation', () => {
    describe('`id`', () => {
      it('should not call `next` if `id` is invalid', async () => {
        let called = false;

        await router.params.id('foobar', {}, () => {
          called = true;
        });

        expect(called).toBeFalsy();
      });

      it('should call `next` if `id` is an uuid', async () => {
        let called = false;

        await router.params.id('24510e52-c666-4085-8ce0-2f5d95c32a94', {}, () => {
          called = true;
        });

        expect(called).toBeTruthy();
      });
    });
  });

  it('should throw a `MalformedRequestBodyError` error if the request body is not an object', async () => {
    await request
      .post('/')
      .set('content-type', 'application/json')
      .send(1)
      .expect(400)
      .expect({
        code: 'malformed_request_body',
        message: 'Malformed Request Body'
      });
  });
});
