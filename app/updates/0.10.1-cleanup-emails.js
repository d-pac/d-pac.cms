'use strict';
const _ = require('lodash');
const usersService = require('../services/users');
const log = _.partial( console.log, require( 'path' ).basename( __filename ) + ':' );

module.exports = function( done ){
  usersService.list({})
    .map(function( user ){
      user.email = _.trim( user.email.toLowerCase() );
      return user.save();
    })
    .then(function( usersList ){
      log('Updated', usersList.length, 'users');
      return null;
    })
    .asCallback(done);
};
