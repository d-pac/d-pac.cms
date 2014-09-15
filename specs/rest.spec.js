'use strict';
/*global describe, it*/
process.env.NODE_ENV = "tests";
require( 'dotenv' ).load();

var _ = require('lodash');
var expect = require( 'must' );
var request = require( 'supertest' );
var urls = {
  root : "http://localhost:" + process.env.PORT
};

function bodyHasFields(required){
  return function(res){
    var diff =  _.difference(required, _.keys(res.body) );
    if(diff.length){
      return 'Body missing: ' + diff.toString();
    }
  };
}

describe( "spec", function(){
  it( "should run", function(){
    expect( true ).to.be.true();
  } );
} );// spec

describe( "/api", function(){
  urls.api = urls.root + '/api';

  it( 'should return 404 when not found', function( done ){
    request( urls.api )
      .get( '/invalid' )
      .expect( 404, done );
  } );

  describe( '/me', function(){
    urls.me = urls.api + '/me';

    describe( '/session', function(){
      var url = urls.session = urls.me + '/session';
      describe( 'GET', function(){
        it( 'should return 401 when no session exists', function( done ){
          request( url )
            .get( '' )
            .expect( 401, done );
        } );
      } );// GET /api/me/session

      describe( 'POST', function(){
        it( 'should return 400 when missing required field', function( done ){
          request( url )
            .post( '' )
            .send( {
              email : "unregistered@example.com"
            } )
            .expect( 400, done );
        } );
        it( 'should return 401 - with reason - when invalid credentials', function( done ){
          request( url )
            .post( '' )
            .send( {
              email    : "unregistered@example.com",
              password : "invalid password"
            } )
            .expect( function( res ){
              if( !('reason' in res.body) ){
                return "missing reason in body";
              }
            } )
            .expect( 401, done );
        } );
        it( 'should return 200 - with body - and cookie - when valid credentials', function( done ){
          request( url )
            .post( '' )
            .send( {
              email    : "user@keystonejs.com",
              password : "admin"
            } )
            .expect( bodyHasFields(['_csrf', 'id']) )
            .expect( 'set-cookie', /keystone.sid/)
            .expect( 200, done );
        } );
      } );// POST /api/me/session

      //it( 'should return 405 when invalid method used', function( done ){
      //  request( url )
      //    .patch('')
      //    .expect( 405, done );
      //} );
    } );// * /api/me/session
  } );// * /api/me
} );// * /api
