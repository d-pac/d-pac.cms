'use strict';
var debug = require( 'debug' )( 'dpac:services' );
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );
var Phase = keystone.list( 'Phase' );

function getActiveComparison( opts ){
  //console.log( 'getActiveComparison' );
  return Comparison.model
    .findOne( opts )
    .where( 'phase' ).ne( null )
    .populate( 'assessment' )
    .exec();
}

function retrievePhases( opts ){
  //console.log( 'retrievePhases' );
  return Phase.model
    .find()
    .where( '_id' ).in( opts.ids )
    .exec();
}

function retrieveJudgements( opts ){
  //console.log( 'retrieveJudgements' );
  return Judgement.model
    .find( opts )
    .populate( 'representation' )
    .exec();
}

module.exports = function retrieveActiveAggregates( opts,
                                                    next ){
  debug( 'retrieveActiveAggregates', opts );
  var aggregate = {
    assessor : opts.assessor
  };

  var promise = getActiveComparison( { assessor : opts.assessor } )
    .then( function( comparison ){
      if( !comparison ){
        return promise.fulfill();
      }
      aggregate.comparison = comparison;
      aggregate.assessment = comparison.assessment;
    } )
    .then( function(){
      return retrievePhases( {
        ids : aggregate.assessment.phases
      } );
    } )
    .then( function( phases ){
      aggregate.phases = phases;
    } )
    .then( function(){
      return retrieveJudgements( {
        comparison : aggregate.comparison
      }, aggregate );
    } )
    .then( function( judgements ){
      aggregate.judgements = judgements;
      aggregate.representations = _.pluck( judgements, "representation" );
    } )
    .onResolve( function( err ){
      next( err, [aggregate] );
    } );

};
