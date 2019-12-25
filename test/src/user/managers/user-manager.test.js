'use strict';

/**
 * Module dependencies.
 */

const bcrypt = require('bcrypt');
const emailService = require('src/core/services/email-service');
const fixtures = require('test/utils/fixtures');
const mailjet = require('test/utils/mocks/mailjet-mocks');
const userManager = require('src/user/managers/user-manager');
const ValidationFailedError = require('src/core/errors/validation-failed-error');

/**
 * Test `UserManager`.
 */

describe('UserManager', () => {
  describe('createUser()', () => {
    it('should throw a `ValidationFailedError` if `password` is not provided', async () => {
      try {
        await userManager.createUser({ data: { email: 'foo@bar.com', name: 'foo', role: 'admin' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should throw a `ValidationFailedError` if `password` is invalid', async () => {
      try {
        await userManager.createUser({ data: { email: 'foo@bar.com', name: 'foo', password: 'biz', role: 'admin' } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should create a user with given `password` hashed', async () => {
      mailjet.send.succeed();
      jest.spyOn(emailService, 'sendConfirmationEmail');

      const user = await userManager.createUser({ data: { email: 'foo@bar.com', name: 'foo', password: 'foobar', role: 'admin' } });
      const matched = await bcrypt.compare('foobar', user.password);

      expect(emailService.sendConfirmationEmail).toHaveBeenCalled();
      expect(matched).toBeTruthy();
    });

    it('should not send an email if `sendConfirmationEmail` is false', async () => {
      jest.spyOn(emailService, 'sendConfirmationEmail');

      await userManager.createUser({ data: { email: 'foo@bar.com', name: 'foo', password: 'foobar', role: 'admin' }, sendConfirmationEmail: false });

      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword()', () => {
    it('should confirm the user if `confirmedAt` is not set', async () => {
      mailjet.send.succeed();
      mailjet.send.succeed();
      mailjet.send.succeed();

      const loaded = await fixtures.loadUser({ role: 'standard' });
      const user = await userManager.forgotPassword({ user: loaded });

      expect(user.confirmedAt).toBeNull();

      const updated = await userManager.resetPassword({ password: 'foobiz', user });
      const matched = await bcrypt.compare('foobiz', updated.password);

      expect(matched).toBeTruthy();
      expect(updated.confirmedAt).toBeTruthy();
      expect(updated.resetPasswordTokenAt).toBeNull();
    });
  });

  describe('updateUser()', () => {
    it('should throw a `ValidationFailedError` if `password` is invalid', async () => {
      mailjet.send.succeed();

      const { id } = await fixtures.loadUser({ role: 'admin' });

      try {
        await userManager.updateUser({ data: { password: 'biz' }, where: { id } });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationFailedError);
      }
    });

    it('should update a user with given `password` hashed', async () => {
      mailjet.send.succeed();

      const { id } = await fixtures.loadUser({ role: 'admin' });
      const user = await userManager.updateUser({ data: { password: 'bizbaz' }, where: { id } });
      const matched = await bcrypt.compare('bizbaz', user.password);

      expect(matched).toBeTruthy();
    });
  });
});
