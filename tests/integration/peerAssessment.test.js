'use strict';
var debug = require( "debug" )( "dpac:tests:integration:peerAssessment" );
var util = require( 'util' );
var _ = require( 'lodash' );
var expect = require( 'must' );
var P = require( 'bluebird' );

var fixtures = require( './fixtures' );
var createHelper = require( './helper' );
var env = require( '../env' );
var mocks, helpers;

describe.skip( 'peer assessment', function(){
  before( function( done ){
    env.setup()
      .then( function(){
        debug( 'mocks - creation requested' );
        return fixtures.peerAssessment.create( env );
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

    function getItem(list, idStr){
      return _.find( list, function( item ){
        return item.id === idStr;
      } );
    }

    function hasId( list,
                    idStr ){
      return !!getItem(list, idStr);
    }

    before( function(){
      representationCounts = _.reduce( mocks.representations, function( memo,
                                                                        representation ){
        var idStr = representation.id.toString();
        memo[ idStr ] = {
          value: 0,
          id: idStr,
          doc: representation
        };
        return memo;
      }, {} );
    } );
    _.times( 200, function( i ){
      it( 'should create a valid comparison for iteration ' + i, function( done ){
        var assessor = _.sample( mocks.assessors );
        var grouped = _.chain( representationCounts )
          .filter(function(item){
            var document = getItem(mocks.documents, item.doc.document.toString());
            var areEquals = assessor.id === document.owner.toString();
            //var areEquals = document.owner.equals(assessor.id);
            return !areEquals;
          })
          .groupBy( function( item ){
            return item.value;
          } )
          .value();
        var values = Object.keys( grouped ).sort( function( a,
                                                            b ){
          return a - b;
        } );
        debug( 'values', values );
        candidates = grouped[ values[ 0 ] ];
        if( candidates.length <= 2 ){
          required = candidates;
          candidates = grouped[ values[ 1 ] ];
        } else {
          required = [];
        }
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
            try{
              switch( required.length ){
                case 2:
                  expect( hasId( required, aId ) && hasId( required, bId ), "Required representation was not selected" ).to.be.true();
                  break;
                case 1:
                  if( hasId( required, aId ) ){
                    expect( hasId( candidates, bId ), "Selected representation was not a candidate" ).to.be.true();
                  } else if( hasId( required, bId ) ){
                    expect( hasId( candidates, aId ), "Selected representation was not a candidate" ).to.be.true();
                  } else {
                    throw new Error( "Required representation was not selected" );
                  }
                  break;
                case 0:
                  var aWasCandidate = hasId( candidates, aId );
                  var bWasCandidate = hasId( candidates, bId );
                  expect( aWasCandidate && bWasCandidate,
                    "Selected representation was not a candidate" ).to.be.true();
                  break;
                default:
                  throw Error( "Cannot have more than 2 representations required" );
              }
            } catch( err ) {
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
            representationCounts[ aId ].value++;
            representationCounts[ bId ].value++;
            return {
              a: representationCounts[ aId ],
              b: representationCounts[ bId ]
            };
          } )
          .then( function( compared ){
            debug( 'Comparison finalized:', util.inspect( compared ) );
            done();
          } )
          .catch( done );
      } );
    } );
  } );
} );
