'use strict';
/*global describe, it*/
process.env.NODE_ENV = "tests";
require( 'dotenv' ).load();

var _ = require( 'lodash' );
var expect = require( 'must' );
var request = require( 'supertest' );
var urls = {
  root : "http://localhost:" + process.env.PORT
};
urls.api = urls.root + '/api';
urls.me = urls.api + '/me';
urls.session = urls.me + '/session';
urls.account = urls.me + '/account';

var auth = {};

function bodyHasFields( required ){
  return function( res ){
    var diff = _.difference( required, _.keys( res.body ) );
    if( diff.length ){
      return 'Body missing: ' + diff.toString();
    }
  };
}

describe( "spec", function(){
  it( "should run", function(){
    expect( true ).to.be.true();
  } );
} );// spec

describe( urls.api, function(){
  var url = urls.api;
  it( 'should return 401 when not found', function( done ){
    request( url )
      .get( '/invalid' )
      .expect( 401, done );
  } );

  describe( 'when not logged in', function(){

    describe( 'me', function(){
      describe( 'session', function(){
        var url = urls.session;

        describe( 'GET', function(){
          it( 'should return 401 when no session exists', function( done ){
            request( url )
              .get( '' )
              .expect( 401, done );
          } );
        } );//GET

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
              .expect( bodyHasFields( ['_csrf'] ) )
              .expect( 'set-cookie', /keystone.sid/ )
              .expect( 200 )
              .end( function( err,
                              res ){
                if(err){
                  return done(err);
                }
                auth.Cookie = res.headers['set-cookie'].pop().split( ';' )[0];
                auth._csrf = res.body._csrf;
                done();
              } );
          } );
        } );//POST

      } );//session
    } );//me
  } );//when not logged in
  describe( 'when logged in', function(){
    describe( 'me', function(){
      describe( 'session', function(){
        var url = urls.session;

        describe( 'invalid method', function(){
          it( 'should return 405', function( done ){
            request( url )
              .patch( '' )
              .set( auth ).send( auth )
              .expect( 405, done );
          } );
        } );

        describe( 'GET', function(){
          it( 'should return 200 - with body', function( done ){
            request( url )
              .get( '' )
              .set( auth ).send( auth )
              .expect( bodyHasFields( ['_id', 'name', 'email'] ) )
              .expect( 200, done );
          } );
        } );//GET

      } );//session
      describe( 'account', function(){
        var url = urls.account;

        describe( 'invalid method', function(){
          it( 'should return 405', function( done ){
            request( url )
              .delete( '' )
              .set( auth ).send( auth )
              .expect( 405, done );
          } );
        } );

        describe( 'GET', function(){
          it( 'should return 200 - with body', function( done ){
            request( url )
              .get( '' )
              .set( auth ).send( auth )
              .expect( bodyHasFields( ['_id', 'name', 'email'] ) )
              .expect( 200, done );
          } );
        } );//GET

        describe('PATCH', function(){
          it('should return 200 - with body - and changes saved', function(done){
            var name = Date.now().toString();
            request(url)
              .patch('')
              .set( auth ).send( auth )
              .send({name:{first:name}})
              .expect( 200, done);
          });
        });//PATCH
      } );//account
    } );//me
  } );//when logged in
} );//api
