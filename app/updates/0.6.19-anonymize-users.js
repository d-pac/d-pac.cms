'use strict';
var _ = require( 'lodash' );
var usersService = require( '../services/users' );
var P = require( 'bluebird' );
var autoinc = require( '../models/helpers/autoinc' );

var log = _.partial(console.log, require('path').basename(__filename) + ':');

exports = module.exports = function( done ){
  var counter = 0;
  usersService.list({})
    .each( function( user ){
      user._rid = ++counter;
      return user.save();
    } )
    .then( function(){
      return autoinc.setCount( {
        model: "User",
        field: "_rid",
        count: ++counter
      } );
    } )
    .then( function(){
      log("Updated", counter, "users");
      done();
    } )
    .catch( done );
};
