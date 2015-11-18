'use strict';
var debug = require( "debug" )( "dpac:tests:functional:benchmarkedAssessment" );

var _ = require( 'lodash' );
var expect = require( 'must' );

var fixtures = require( './fixtures' );
var env = require( '../env' )
var mocks;

describe.skip( 'benchmarked assessment', function(){
  before( function( done ){
    env.setup()
      .then( function(){
        debug( 'mocks - creation requested' );
        return fixtures.benchmarkedAssessment.create( env )
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
