'use strict';
var _ = require( 'underscore' );
var debug = require( 'debug' )( 'dpac:services.aggregates' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var errors = require( 'errors' );

var representations = require( './representations' );
var judgements = require( './judgements' );
var comparisons = require( './comparisons' );
var assessments = require( './assessments' );
var phases = require( './phases' );

/**
 *
 * @param opts
 * @param opts.assessor User.id
 * @param opts.assessment Assessment.id
 * @return {Promise}
 */
module.exports.create = function createAggregate( opts ){
  debug( '#create' );

  var aggregate = {
    assessor : opts.assessor
  };
  return assessments.retrieve( { assessment : opts.assessment } )
    .then( function handleAssessment( assessment ){
      if( !assessment ){
        throw new errors.Http422Error( { reason : 'Assessment not found.' } );
      }
      aggregate.assessment = assessment;
      aggregate.phases = assessment.phases;
      assessment.phases = _.pluck( assessment.phases, '_id' );
    } )
    .then( function(){
      return representations.retrievePair();
    } )
    .then( function handleRepresentations( representations ){
      //todo: when no representations found
      aggregate.representations = representations;
    } )
    .then( function(){
      var firstPhase;
      if( aggregate.phases && aggregate.phases.length > 0 ){
        firstPhase = aggregate.phases[0];
      }
      return comparisons.create( {
        assessor   : opts.assessor,
        assessment : opts.assessment,
        phase      : firstPhase
      } );
    } )
    .then( function handleComparison( comparison ){
      aggregate.comparison = comparison;
    } )
    .then( function(){
      return judgements.create( {
        assessor        : opts.assessor,
        assessment      : opts.assessment,
        representations : aggregate.representations,
        comparison      : aggregate.comparison
      } );
    } )
    .then( function handleJudgements( judgements ){
      aggregate.judgements = judgements;
      return aggregate;
    } );
};

/**
 *
 * @param opts
 * @param opts.assessor User.id
 * @return {Promise}
 */
module.exports.listActives = function listActives( opts ){
  debug( '#listActives' );
  var aggregates = [];

  return comparisons.retrieveActive( { assessor : opts.assessor } )
    .then( function handleComparisons( comparisons ){
      _.each( comparisons, function( comparison ){
        var aggregate = {};
        aggregate.assessor = comparison.assessor;
        aggregate.assessment = comparison.assessment;
        aggregate.comparison = comparison;
        comparison.assessment = comparison.assessment._id;
        aggregates.push( aggregate );
      } );
    } )
    .then( function(){
      var promise;
      _.each( aggregates, function( aggregate ){
        var p = phases.retrieve( {
          ids : aggregate.assessment.phases
        } ).then( function handlePhases( phases ){
          aggregate.phases = phases;
        } );
        promise = ( promise )
          ? promise.chain( p )
          : p;
      } );
      return promise;
    } )
    .then( function(){
      var promise;
      _.each( aggregates, function( aggregate ){
        var p = judgements.retrieve( {
          comparison : aggregate.comparison
        } ).then( function handleJudgements( judgements ){
          //promote and flatten populated objects
          aggregate.judgements = judgements;
          var representations = [];
          _.each( judgements, function( judgement ){
            var representation = judgement.representation;
            judgement.representation = representation._id;
            representations.push( representation );
          } );
          aggregate.representations = representations;
        } );
        promise = ( promise )
          ? promise.chain( p )
          : p;
      } );
      return promise;
    } )
    .then( function handleOutput(){
      return aggregates;
    } );

};
