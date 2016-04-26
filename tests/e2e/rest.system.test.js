'use strict';

var _ = require( 'lodash' );
var expect = require( 'must' );
var request = require( 'supertest' );

var env = require( '../env' );
let rest;

describe( 'REST API: system', function(){
  before( function( done ){
    env.setup()
      .then( ()=>{
        rest = request(env.config.API_URL);
        done();
      } )
      .catch( done );
  } );

  describe( 'spec', ()=>{
    it( 'should run', ()=> expect( true ).to.be.true() );
  } );

  describe( '/system', ()=>{
    describe( '/ping', ()=>{
      it( 'should return 200 when available', ( done )=>{
        rest.get( '/system/ping' )
          .expect( 200, done );
      } );
    } );
  } )
} );
