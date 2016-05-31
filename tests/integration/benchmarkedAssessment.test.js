'use strict';
var debug = require( "debug" )( "dpac:tests:integration:benchmarkedAssessment" );

var fixtures = require( './fixtures' );
var env = require( '../env' );
var mocks; //eslint-disable-line no-unused-vars

describe.skip( 'benchmarked assessment', function(){
  before( function( done ){
    env.setup()
      .then( function(){
        debug( 'mocks - creation requested' );
        return fixtures.benchmarkedAssessment.create( env );
      } )
      .then( function( data ){
        debug( 'mocks - creation completed' );
        mocks = data;
        done();
      } )
      .catch( done );
  } );

  it( 'should test everything' );
} );
