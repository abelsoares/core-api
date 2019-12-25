'use strict';

/**
 * Module dependencies.
 */

const nock = require('nock');
const url = 'https://api.mailjet.com/v3.1';

/**
 * Export mocked requests.
 */

module.exports = {

  /**
   * Send request.
   */

  send: {
    succeed() {
      return nock(url).post('/send').reply(200, {
        Messages: [{
          Bcc: [],
          Cc: [],
          CustomID: '',
          Status: 'success',
          To: [{
            Email: 'foo@bar.com',
            MessageHref: 'https://api.mailjet.com/v3/REST/message/000000000000000000',
            MessageID: '000000000000000000',
            MessageUUID: '00000000-0000-0000-0000-000000000000'
          }]
        }]
      });
    }
  }
};
