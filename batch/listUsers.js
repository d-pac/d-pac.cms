"use strict";

var keystone = require( "keystone" );
var User = keystone.list( "User" );

exports = module.exports = function( done ){

  User.model.find().exec( function( err,
                                    result ){
    console.log( result );
    done();
  } );
};
