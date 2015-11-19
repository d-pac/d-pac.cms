'use strict';
var debug = require( "debug" )( "dpac:tests:functional:comparativeAssessment" );

var util = require( 'util' );
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

  describe( 'Multiple iterations', function(){
    var representationCounts;
    var candidates, required;

    function hasId( list,
                    idStr ){
      return !!_.find( list, function( item ){
        return item.id === idStr;
      } );
    }

    before( function(){
      representationCounts = _.reduce( mocks.representations, function( memo,
                                                                        representation ){
        var idStr = representation.id.toString();
        memo[ idStr ] = {
          value: 0,
          id: idStr
        };
        return memo;
      }, {} );
    } );
    beforeEach( function(){
      var grouped = _.groupBy( representationCounts, function( item ){
        return item.value;
      } );
      var values = Object.keys( grouped ).sort( function( a,
                                                          b ){
        return a - b;
      } );
      candidates = grouped[ values[ 0 ] ];
      if( candidates.length <= 2 ){
        required = candidates;
        candidates = grouped[ values[ 1 ] ]
      } else {
        required = [];
      }
    } );
    _.times( 200, function( i ){
      it( 'should create a valid comparison for iteration ' + i, function( done ){
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
            var aId = selected.a.id.toString();
            var bId = selected.b.id.toString();
            representationCounts[ aId ].value++;
            representationCounts[ bId ].value++;
            var compared = {
              a: representationCounts[ aId ],
              b: representationCounts[ bId ]
            };
            try{
              switch( required.length ){
                case 2:
                  expect( hasId( required, aId ) && hasId( required, bId ), "Required representation was not selected (2a)" ).to.be.true();
                  break;
                case 1:
                  if( hasId( required, aId ) ){
                    expect( hasId( candidates, bId ), "Selected representation was not a candidate (1a)" ).to.be.true();
                  } else if( hasId( required, bId ) ){
                    expect( hasId( candidates, aId ), "Selected representation was not a candidate (1b)" ).to.be.true();
                  } else {
                    throw new Error( "Required representation was not selected (1c)" );
                  }
                  break;
                case 0:
                  var aWasCandidate = hasId( candidates, aId );
                  var bWasCandidate = hasId( candidates, bId );
                  expect( aWasCandidate && bWasCandidate,
                    "Selected representation was not a candidate (0a)" ).to.be.true();
                  break;
                default:
                  throw Error( "Cannot have more than 2 representations required" );
              }
            } catch( err ) {
              debug( 'Comparison ' + i + ' finalized:', util.inspect( compared ) );
              throw err;
            }
            expect( selected.a,
              'comparison.representations.a is not persisted to database' ).to.not.be.undefined();
            expect( selected.b,
              'comparison.representations.b is not persisted to database' ).to.not.be.undefined();
            expect( helpers.representations.occursInList( selected.a.compared, selected.b ),
              'comparisons.representations.a is not compared with representation b' ).to.be.true();
            expect( helpers.representations.occursInList( selected.b.compared, selected.a ),
              'comparisons.representations.b is not compared with representation a' ).to.be.true();
            return compared;
          } )
          .then( function( compared ){
            debug( 'Comparison ' + i + ' finalized:', util.inspect( compared ) );
            done();
          } )
          .catch( done );
      } );
    } );
  } );
} );
