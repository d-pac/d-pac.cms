'use strict';
var debug = require( "debug" )( "dpac:tests:functional:comparativeAssessment" );

var _ = require( 'lodash' );
var expect = require( 'must' );

var fixtures = require( './fixtures' );
var env = require( '../env' )
var mocks;

describe( 'comparative assessment', function(){
  before( function( done ){
    env.setup()
      .then( function(){
        debug( 'mocks - creation requested' );
        return fixtures.comparativeAssessment.create( env )
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
