/**
 * Created by creynder on 23/03/2017.
 */
'use strict';

const crypto = require('crypto');
const P = require('bluebird');

module.exports = function createToken() {
  return crypto.randomBytes( 16 ).toString( 'hex' );
};
