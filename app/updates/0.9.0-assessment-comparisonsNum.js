"use strict";

const P = require( 'bluebird' );
const _ = require( 'lodash' );
const assessmentsService = require( '../services/assessments' );
const comparisonsService = require( '../services/comparisons' );
const representationsService = require( '../services/representations' );
const usersService = require( '../services/users' );

const log = _.partial( console.log, require( 'path' ).basename( __filename ) + ':' );

module.exports = function( done ){
  assessmentsService
    .list( {} )
    .map( function( doc ){
      return JSON.parse( JSON.stringify( doc ) );
    } )
    .map( function( doc ){
      const update = {
        _id: doc._id,
      };
      let dim = 'representation';
      if( _.get( doc, [ 'comparisonsNum', 'perRepresentation' ], 0 ) !== 0 ){
        update[ "comparisons.perRepresentation" ] = doc.comparisonsNum.perRepresentation;
      }
      const pA = _.get( doc, [ 'comparisonsNum', 'perAssessor' ], [] );
      if( pA.length !== 0 ){
        update[ "comparisons.perAssessor" ] = _.reduce( pA, ( memo,
                                                              value )=>memo + value, 0 );
        dim = 'assessor';
      }
      if( doc.algorithm === 'benchmarked-comparative-selection' ){
        update[ "assessorsNum.minimum" ] = 4;
      }
      if( typeof _.get( doc, [ 'comparisons', 'dimension' ] ) === 'undefined' ){
        update[ "comparisons.dimension" ] = dim;
      }

      return P.props( {
        comparisonsNum: comparisonsService.count( { assessment: update._id } ),
        representationsNum: representationsService.countToRanks( { assessment: update._id } ),
        assessorsNum: usersService.countInAssessment( 'assessor', update._id )
      } )
        .then( ( values )=>{
          update[ "cache.representationsNum" ] = values.representationsNum;
          update[ "cache.comparisonsNum" ] = values.comparisonsNum;
          update[ "cache.assessorsNum" ] = values.assessorsNum;
          return update;
        } )
        .catch( ( err )=>done( err ) );
    } )
    .then( function( updates ){

      return P.mapSeries( updates, ( update )=>{
        return assessmentsService.collection.model.update( { _id: update._id }, update );
      } )
        .catch( ( err )=>done( err ) );
    } )
    .then( function( results ){
      log( "Updated", results.length, "assessments" );
      done();
    } )
    .catch( ( err )=>done( err ) );
};
