'use strict';
var debug = require( 'debug' )( 'dpac:services' );
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );
var Phase = keystone.list( 'Phase' );

function retrievActiveComparison( opts ){
  //console.log( 'retrievActiveComparison' );
  return Comparison.model
    .findOne( opts )
    .where( 'phase' ).ne( null )
    .populate( 'assessment' )
    .lean()
    .exec();
}

function retrievePhases( opts ){
  //console.log( 'retrievePhases' );
  return Phase.model
    .find()
    .where( '_id' ).in( opts.ids )
    .lean()
    .exec();
}

function retrieveJudgements( opts ){
  //console.log( 'retrieveJudgements' );
  return Judgement.model
    .find( opts )
    .populate( 'representation' )
    .lean()
    .exec();
}

module.exports = function retrieveActiveAggregates( opts,
                                                    next ){
  debug( 'retrieveActiveAggregates', opts );
  var aggregate = {};

  var promise = retrievActiveComparison( { assessor : opts.assessor } )
    .then( function handleComparison( comparison ){
      if( !comparison ){
        return promise.fulfill([]);
      }
      //promote and flatten populated objects
      var assessment = comparison.assessment;
      aggregate.comparison = comparison;
      aggregate.assessment = assessment;
      comparison.assessment = assessment._id;
    } )
    .then( function(){
      return retrievePhases( {
        ids : aggregate.assessment.phases
      } );
    } )
    .then( function handlePhases( phases ){
      aggregate.phases = phases;
    } )
    .then( function(){
      return retrieveJudgements( {
        comparison : aggregate.comparison
      }, aggregate );
    } )
    .then( function handleJudgements( judgements ){
      //promote and flatten populated objects
      aggregate.judgements = judgements;
      var representations = [];
      _.each( judgements, function( judgement ){
        var representation = judgement.representation;
        judgement.representation = representation._id;
        representations.push( representation );
      } );
      aggregate.representations = representations;
    } )
    .then( function handleOutpu(){
      aggregate.assessor = opts.assessor;
      promise.fulfill([aggregate]);
    } )
    .onResolve( function( err, output ){
      next( err, output );
    } );

};
