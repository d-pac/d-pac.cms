"use strict";
var keystone = require( 'keystone' );
var async = require( 'async' );
var _ = require( 'lodash' );
var usersService = require( '../services/users' );
var User = keystone.list( 'User' );
exports = module.exports = function( done ){
  usersService
    .list( {} )
    .map( function( doc ){
      return JSON.parse( JSON.stringify( doc ) );
    } )
    .filter( function( user ){
      return _.isArray( user.assessments );
    } )
    .map( function( user ){
      user.assessments = {
        assessor: user.assessments,
        assessee: []
      };
      return user;
    } )
    .then( function( users ){
      async.eachSeries( users, function( user,
                                         next ){
        User.model.update( { _id: user._id }, user, next );
      }, done );
    } )
    .catch( done );
};
