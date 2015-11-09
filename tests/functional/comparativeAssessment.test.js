'use strict';
var debug = require( "debug" )( "dpac:tests:functional:comparativeAssessment" );

var _ = require( 'lodash' );
var expect = require( 'must' );
var P = require( 'bluebird' );

var fixtures = require( './fixtures' );
var createHelper = require( './helper' );
var env = require( '../env' );
var mocks, helpers;

describe( 'comparative assessment', function(){
  before( function( done ){
    env.setup()
      .then( function(){
        debug( 'mocks - creation requested' );
        return fixtures.comparativeAssessment.create( env )
      } )
      .then( function( data ){
        debug( 'mocks - creation completed' );
        data.comparisons = [];
        mocks = data;
        helpers = {
          representations: createHelper( env.app.lists.Representation.model ),
          comparisons: createHelper( env.app.lists.Comparison.model ),
          assessors: createHelper( env.app.lists.User.model )
        };
        done();
      } )
      .catch( done );
  } );

  describe( '', function(){
    it( 'should create a valid comparison', function( done ){
      var assessor = _.sample( mocks.assessors );
      env.services.comparisons.create( {
          assessor: assessor,
          assessment: mocks.assessment.id
        } )
        .then( function( comparison ){
          expect( helpers.comparisons.isInstanceOf( comparison ),
            'result is not a comparison' ).to.be.true();
          expect( comparison.assessment.equals( mocks.assessment.id ),
            'comparison.assessment should reference selected assessment' ).to.be.true();
          expect( helpers.assessors.areEqual( comparison.assessor, assessor ),
            'comparison.assessor should reference selected user' ).to.be.true();
          return P.props( {
            a: env.services.representations.retrieve( { _id: comparison.representations.a } ),
            b: env.services.representations.retrieve( { _id: comparison.representations.b } )
          } );
        } )
        .then( function( selected ){
          expect( selected.a,
            'comparison.representations.a is not persisted to database' ).to.not.be.undefined();
          expect( selected.b,
            'comparison.representations.b is not persisted to database' ).to.not.be.undefined();
          expect( helpers.representations.occursInList( selected.a.compared, selected.b ),
            'comparisons.representations.a is not compared with representation b' ).to.be.true();
          expect( helpers.representations.occursInList( selected.b.compared, selected.a ),
            'comparisons.representations.b is not compared with representation a' ).to.be.true();
        } )
        .then( done );
    } )
  } );
} );
