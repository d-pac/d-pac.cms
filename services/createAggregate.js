'use strict';
var _ = require( 'underscore' );
var debug = require( 'debug' )( 'dpac:services' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var Assessment = keystone.list( 'Assessment' );
var Representation = keystone.list( 'Representation' );
var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );
var Phase = keystone.list( 'Phase' );

function retrieveAssessment( opts ){
  return Assessment.model
    .findById( opts.assessment )
    .exec();
}

function retrieveRepresentations( opts ){

  //todo: replace this with CJ
  return Representation.model
    .find()
    .sort( { createdAt : -1 } )
    .limit( 2 )
    .exec();
}

function createComparison( opts ){
  return Comparison.model
    .create( opts );
}

function createJudgements( opts ){
  var judgements = [];
  _.each( opts.representations, function( representation ){
    judgements.push( {
      assessor       : opts.assessor,
      assessment     : opts.assessment,
      comparison     : opts.comparison,
      representation : representation
    } );
  } );
  return Judgement.model
    .create( judgements )
    .then( function(){
      //won't be handled correctly in the promise chain, unless if we pass them along here
      return _.toArray( arguments );
    } );
}

function retrievePhases( opts ){
  return Phase.model
    .find()
    .where( '_id' ).in( opts.ids )
    .exec();
}

/**
 *
 * @param opts
 * @param opts.assessor
 * @param opts.assessment
 * @param next
 */

module.exports = function createAggregate( opts,
                                           next ){
  debug( 'createAggregate' );
  var aggregate = {
    assessor : opts.assessor
  };
  var promise = retrieveAssessment( { assessment : opts.assessment } )
    .then( function handleAssessment( assessment ){
      aggregate.assessment = assessment;
    } )
    .then( function(){
      return retrieveRepresentations();
    } )
    .then( function handleRepresentations( representations ){
      if( !representations || representations.length <= 0 ){
        return promise.fulfill();
      }
      aggregate.representations = representations;
    } )
    .then( function(){
      return createComparison( {
        assessor   : opts.assessor,
        assessment : opts.assessment
      } );
    } )
    .then( function handleComparison( comparison ){
      return aggregate.comparison = comparison;
    } )
    .then( function(){
      return createJudgements( {
        assessor        : opts.assessor,
        assessment      : opts.assessment,
        representations : aggregate.representations,
        comparison      : aggregate.comparison
      } );
    } )
    .then( function handleJudgements( judgements ){
      return aggregate.judgements = judgements;
    } )
    .then( function(){
      return retrievePhases( {
        ids : aggregate.assessment.phases
      } );
    } )
    .then( function handlePhases( phases ){
      return aggregate.phases = phases;
    } )
    .onResolve( function( err,
                          result ){
      next( err, aggregate );
    } );

};
