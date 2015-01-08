'use strict';

var keystone = require( 'keystone' );
var _ = require( 'underscore' );
var _s = require( 'underscore.string' );
var Bluebird = require( "bluebird" );
var objectId = require( 'mongoose' ).Types.ObjectId;
var constants = require( '../models/helpers/constants' );
var User = keystone.list( "User" );
var Persona = keystone.list( "Persona" );

var numOfUsers = 25;
var prefix = "GG";
var begin = 1;

var assessment = "5458894f0138e02976448d26";
var users = [];
var personas = [];

function createUser( data ){
  return User.model.create( data );
}

function createPersona( data ){
  return Persona.model.create( data );
}

function createUserAndPersona( i ){
  var counter = i + begin;
  var iPad = _s.lpad( counter.toString(), 2, "0" ); //sorry, couldn't resist
  return createUser( {
    'name.full' : [prefix, iPad].join( " " ),
    email       : [prefix.toLowerCase(), iPad, "@d-pac.org"].join( "" ),
    password    : "test"
  } ).then( function( user ){
    return createPersona( {
      assessment : assessment,
      user       : user._id,
      role       : constants.roles.assessor
    } );
  } );
}

module.exports = function( done ){
  var promises = _.times( numOfUsers, createUserAndPersona );
  Bluebird.all( promises ).then( function(){
    console.log( "finished" );
    done();
  } );
};

//_.times( numOfUsers, function( i ){
//  var counter = i+begin;
//  var iPad = _s.lpad( counter.toString(), 2, "0" ); //sorry, couldn't resist
//  var ref = [prefix.toLowerCase(), iPad].join( "" );
//  users.push( {
//    'name.full' : [prefix, iPad].join( " " ),
//    email       : [ref, "@d-pac.org"].join( "" ),
//    password    : "test",
//    __ref       : ref
//  } );
//  personas.push( {
//    assessment : assessment,
//    user : ref,
//    role : constants.roles.assessor
//  } );
//} );
//
//exports.create = {
//  User : users,
//  Persona : personas
//}, function( err,
//             stats ){
//  if( err ){
//    console.log( err );
//  }
//  if( stats ){
//    console.log( stats );
//  }
//};
