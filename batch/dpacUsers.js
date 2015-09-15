"use strict";

var keystone = require( "keystone" );
var async = require( "async" );
var User = keystone.list( "User" );

function createUsers( users,
                      done ){
  User.model.create( users, function( err,
                                      created ){
    if( created && created.length ){
      created.forEach( function( user ){
        console.log( 'User created: ' + user.email );
      } );
    }
    done( err );
  } );
}

exports = module.exports = function( users,
                                     done ){
  async.reduce( users, [], function( memo,
                                     user,
                                     next ){
    User.model.findOne( {
      email: user.email
    } ).exec( function( err,
                        result ){
      if( result ){
        console.log( "user '" + user.email + "' already exists." );
      } else {
        memo.push( user );
      }
      return next( null, memo );
    } );
  }, function( err,
               users ){
    createUsers( users, done );
  } );
};
