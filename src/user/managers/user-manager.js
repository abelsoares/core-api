'use strict';

/**
 * Module dependencies.
 */

const AbstractManager = require('src/core/managers/abstract-manager');
const bcrypt = require('bcrypt');
const config = require('config');
const crypto = require('src/core/security/crypto');
const emailService = require('src/core/services/email-service');
const moment = require('moment');
const userModel = require('src/user/models/user-model');
const { toLower } = require('lodash');
const { validate } = require('src/core/validator');

/**
 * `UserManager`.
 */

class UserManager extends AbstractManager {

  /**
   * Change password.
   */

  async changePassword({ data, user }) {
    const { oldPassword, password } = validate(data, {
      allOf: [{
        properties: {
          oldPassword: { type: 'string' },
          password: {
            minLength: config.get('authorization.password.minLength'),
            type: 'string'
          }
        }
      }, {
        required: [
          'oldPassword',
          'password'
        ]
      }]
    });

    // Check if passwords are valid.
    const isNewPasswordTheSame = await bcrypt.compare(password, user.password);
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    validate({ isNewPasswordTheSame, isOldPasswordValid }, {
      properties: {
        isNewPasswordTheSame: { const: false },
        isOldPasswordValid: { const: true }
      }
    });

    const updated = await this.updateUser({ data: { password }, where: { id: user.id } });

    await emailService.sendResetPasswordEmailSucceed({ user });

    return updated;
  }

  /**
   * Confirm user.
   */

  async confirmUser({ transaction, user }) {
    this.logger.debug({ id: user.id }, 'Confirming user');

    return await super.update({
      data: {
        confirmedAt: moment().format()
      },
      transaction,
      where: {
        confirmedAt: null,
        id: user.id
      }
    });
  }

  /**
   * Create user.
   */

  async createUser({ data, sendConfirmationEmail = true }) {
    validate(data, 'user-create');

    const user = await super.create({
      data: {
        ...data,
        email: toLower(data.email),
        password: await crypto.hash({ data: data.password, salt: config.get('authorization.password.saltLength') })
      }
    });

    if (sendConfirmationEmail) {
      await emailService.sendConfirmationEmail({ user });
    }

    return user;
  }

  /**
   * Recover password for a given user.
   */

  async forgotPassword({ user }) {
    const updated = await this.updateUser({ data: { resetPasswordTokenAt: moment().format() }, where: { id: user.id } });

    await emailService.sendResetPasswordEmail({ user });

    return updated;
  }

  /**
   * Reset password.
   */

  async resetPassword({ password, user }) {
    const updated = await this.model.knex.transaction(async transaction => {
      // eslint-disable-next-line prefer-destructuring
      let updated = await this.updateUser({
        data: {
          password,
          resetPasswordTokenAt: null
        },
        transaction,
        where: {
          id: user.id,
          resetPasswordTokenAt: user.resetPasswordTokenAt
        }
      });

      if (!user.confirmedAt) {
        updated = await this.confirmUser({ transaction, user: updated });
      }

      return updated;
    });

    await emailService.sendResetPasswordEmailSucceed({ user });

    return updated;
  }

  /**
   * Update user.
   */

  async updateUser({ data, transaction, where }) {
    validate(data, 'user');

    const { email, password } = data;

    if (email) {
      data.email = toLower(email);
    }

    if (password) {
      data.password = await crypto.hash({ data: password, salt: config.get('authorization.password.saltLength') });
    }

    return await super.update({ data, transaction, where });
  }

}

/**
 * Export `UserManager`.
 */

module.exports = new UserManager(userModel);
