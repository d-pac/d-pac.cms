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
  console.log('retrieveAssessment');
  return Assessment.model
    .findById( opts.assessment )
    .lean()
    .exec();
}

function retrieveRepresentations( opts ){

  console.log('retrieveRepresentations');
  //todo: replace this with CJ
  return Representation.model
    .find()
    .sort( { createdAt : -1 } )
    .limit( 2 )
    .lean()
    .exec();
}

function createComparison( opts ){
  console.log('createComparison');
  return Comparison.model
    .create( opts );
}

function createJudgements( opts ){
  console.log('createJudgements');
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
  console.log('retrievePhases');
  return Phase.model
    .find()
    .where( '_id' ).in( opts.ids )
    .lean()
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

  var NO_REPRESENTATIONS = 'No representations';

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
      if( !representations || representations.length <= 1 ){
        throw NO_REPRESENTATIONS;
      }
      aggregate.representations = representations;
    } )
    .then( function(){
      var firstPhase;
      if(aggregate.assessment.phases && aggregate.assessment.phases.length > 0){
        firstPhase = aggregate.assessment.phases[0];
      }
      return createComparison( {
        assessor   : opts.assessor,
        assessment : opts.assessment,
        phase : firstPhase
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
      if(err && NO_REPRESENTATIONS === err){
        return next(null, null);
      }
      next( err, aggregate );
    } );
};
