'use strict';
var _ = require( 'lodash' );
var usersService = require( '../services/users' );
var P = require( 'bluebird' );
var autoinc = require( '../models/helpers/autoinc' );

exports = module.exports = function( done ){
  var counter = 0;
  usersService.list()
    .each( function( user ){
      user._rid = ++counter;
      return P.promisify( user.save, user )();
    } )
    .then( function(){
      return P.promisify( autoinc.setCount )( {
        model: "User",
        field: "_rid",
        count: ++counter
      } );
    } )
    .then( function(){
      done();
    } )
    .catch( done );
};
