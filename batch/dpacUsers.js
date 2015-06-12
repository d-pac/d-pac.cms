"use strict";

var keystone = require( "keystone" );
var async = require( "async" );
var User = keystone.list( "User" );

function createAdmin( admin,
                      done ){
  var newAdmin = new User.model( admin );

  newAdmin.isAdmin = true;
  newAdmin.save( function( err ){
    if( err ){
      console.error( "Error adding admin '" + admin.email + "' to the database:" );
      console.error( err );
    } else {
      console.log( "Added admin '" + admin.email + "' to the database." );
    }
    done();
  } );
}

exports = module.exports = function( admins,
                                     done ){
  async.forEach( admins, function( admin,
                                   next ){
    User.model.findOne( {
      email: admin.email
    } ).exec( function( err,
                        result ){
      if( result ){
        console.log( "Admin '" + admin.email + "' already exists." );
        return next();
      }
      createAdmin( admin, next );
    } );
  }, done );
};
