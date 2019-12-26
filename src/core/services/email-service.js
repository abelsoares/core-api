'use strict';

/**
 * Module dependencies.
 */

const config = require('config');
const crypto = require('src/core/security/crypto');
const logger = require('src/core/logging/logger')('email-service');
const mailjet = require('src/core/clients/mailjet');
const moment = require('moment');
const redis = require('src/core/clients/redis');
const URI = require('urijs');

/**
 * `EmailService`.
 */

class EmailService {

  /**
   * Send welcome email.
   */

  async sendConfirmationEmail({ user }) {
    const { unit, value } = config.get('confirmation');
    const token = await crypto.generateToken({ size: 32 });

    await redis.setex(`confirmation:${user.id}`, moment.duration(value, unit).asSeconds(), token);

    logger.debug({ id: user.id, token }, 'Sending confirmation email to user');

    const confirmationUrl = new URI(config.get('router.applicationBaseUrl'))
      .path(config.get('email.paths.accountConfirmation'))
      .query({ token })
      .toString();

    const { body: response } = await mailjet.post('send', { version: 'v3.1' })
      .request({
        Messages: [{
          TemplateErrorDeliver: true,
          TemplateErrorReporting: { Email: config.get('email.errorReportingEmail') },
          TemplateID: 1155653,
          TemplateLanguage: true,
          To: [{
            Email: user.email,
            Name: user.name
          }],
          Variables: {
            confirmationUrl,
            name: user.name
          }
        }]
      });

    logger.debug({ response }, 'Received response from email provider');

    return response;
  }

  /**
   * Send reset password email.
   */

  async sendResetPasswordEmail({ user }) {
    const { unit, value } = config.get('reset');
    const token = await crypto.generateToken({ size: 32 });

    await redis.setex(`reset:${token}`, moment.duration(value, unit).asSeconds(), user.id);

    logger.debug({ id: user.id, token }, 'Sending reset password token to user');

    const resetUrl = new URI(config.get('router.applicationBaseUrl'))
      .path(config.get('email.paths.resetPassword'))
      .query({ token })
      .toString();

    const { body: response } = await mailjet.post('send', { version: 'v3.1' })
      .request({
        Messages: [{
          TemplateErrorDeliver: true,
          TemplateErrorReporting: { Email: config.get('email.errorReportingEmail') },
          TemplateID: 1155671,
          TemplateLanguage: true,
          To: [{
            Email: user.email,
            Name: user.name
          }],
          Variables: {
            name: user.name,
            resetUrl
          }
        }]
      });

    logger.debug({ response }, 'Received response from email provider');

    return response;
  }

  /**
   * Send reset password email succeeded.
   */

  async sendResetPasswordEmailSucceed({ user }) {
    logger.debug({ id: user.id }, 'Sending successful password reset to user');

    const { body: response } = await mailjet.post('send', { version: 'v3.1' })
      .request({
        Messages: [{
          TemplateErrorDeliver: true,
          TemplateErrorReporting: { Email: config.get('email.errorReportingEmail') },
          TemplateID: 1155686,
          TemplateLanguage: true,
          To: [{
            Email: user.email,
            Name: user.name
          }],
          Variables: {
            name: user.name
          }
        }]
      });

    logger.debug({ response }, 'Received response from email provider');

    return response;
  }

}

/**
 * Export `EmailService`.
 */

module.exports = new EmailService();
