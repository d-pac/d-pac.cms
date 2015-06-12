'use strict';
var _ = require( 'underscore' );
var keystone = require( "keystone" );
var async = require( "async" );
var User = keystone.list( "User" );

module.exports = function( file,
                           done ){
  var users;
  try{
    users = require( file );
  } catch( err ) {
    return done( err );
  }
  var saveQueue = [];
  _.each( users, function( userData ){
    var user = new User.model( userData );
    saveQueue.push( user );
  } );
  async.eachSeries( saveQueue, function( doc,
                                         next ){
    console.log( "Saving user:", doc.name.full );
    doc.save( next );
  }, done );
};
