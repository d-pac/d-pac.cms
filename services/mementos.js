'use strict';
var _ = require( 'underscore' );
var debug = require( 'debug' )( 'dpac:services.mementos' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var errors = require( 'errors' );
var Promise = require( 'bluebird' );
var toSafeJSON = require( './utils' ).toSafeJSON;

var representationsService = require( './representations' );
var judgementsService = require( './judgements' );
var comparisonsService = require( './comparisons' );
var assessmentsService = require( './assessments' );
var phasesService = require( './phases' );
var seqsService = require( './seqs' );

/**
 *
 * @param opts
 * @param opts.assessor User.id
 * @param opts.assessment Assessment.id
 * @return {Promise}
 */
module.exports.create = function createMemento( opts ){
  debug( '#create' );

  var memento = {
    assessor : opts.assessor
  };
  return assessmentsService.retrieve( { _id : opts.assessment } )
    .then( function handleAssessment( assessment ){
      if( !assessment ){
        throw new errors.Http422Error( {
          message     : 'Could not create memento.',
          explanation : 'Assessment not found.'
        } );
      }
      memento.assessment = assessment;
      memento.phases = assessment.phases;
      assessment.phases = _.pluck( assessment.phases, '_id' );
    } )
    .then( function getNumOfCompletedComparisons(){
      return comparisonsService.completedCount( {
        assessment : opts.assessment,
        assessor   : opts.assessor
      } );
    } )
    .then( function handleCounts( completedNum ){
      memento.progress = {
        completedNum   : completedNum,
        comparisonsNum : memento.assessment.comparisonsNum
      };
    } )
    .then( function createComparison(){
      var firstPhase;
      if( memento.phases && memento.phases.length > 0 ){
        firstPhase = memento.phases[0];
      }
      return comparisonsService.create( {
        assessor   : opts.assessor,
        assessment : opts.assessment,
        phase      : firstPhase
      } );
    } )
    .then( function handleComparison( comparison ){
      memento.comparison = comparison;
    } )
    .then( function getRepresentationPair(){
      return representationsService.retrievePair( { assessment : opts.assessment } );
    } )
    .then( function handleRepresentations( representations ){
      //todo: when no representations found
      representations[0].compared.push( representations[1]._id );
      representations[1].compared.push( representations[0]._id );
      representations[0].comparedNum++;
      representations[1].comparedNum++;
      representations[0].save();
      representations[1].save();
      return representations;
    } )
    .then( function createJudgements( representations ){
      return judgementsService.create( {
        assessor        : opts.assessor,
        assessment      : opts.assessment,
        representations : representations,
        comparison      : memento.comparison,
        positions       : ["left", "right"]
      } );
    } )
    .then( function handleJudgements( judgements ){
      memento.judgements = _.sortBy( judgements, 'position' ).map(function(judgement){
        return judgement.toJSON();
      });
      return judgements;
    } )
    .then( function listRepresentations( judgements ){
      var promises = _.map( memento.judgements, function( judgement ){
        return representationsService.retrieveFull( {
          _id : judgement.representation
        } )
          .then( function handleRepresentation( representation ){
            judgement.representation = representation.toSafeJSON();
          } );
      } );

      return Promise.all( promises );
    } )
    .then( function(){
      return memento;
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
  var mementos = [];

  return comparisonsService.listActive( { assessor : opts.assessor } )
    .then( function handleComparisons( comparisons ){
      _.each( comparisons, function( comparison ){
        var memento = {};
        memento.assessor = comparison.assessor;
        memento.assessment = comparison.assessment;
        memento.comparison = comparison;
        comparison.assessment = comparison.assessment._id;
        mementos.push( memento );
      } );
    } )
    .then( function getNumOfCompletedComparisons(){
      var promises = _.map( mementos, function( memento ){
        return comparisonsService.completedCount( {
          assessment : memento.assessment._id,
          assessor   : opts.assessor
        } ).then( function( completedNum ){
          memento.progress = {
            completedNum   : completedNum,
            comparisonsNum : memento.assessment.comparisonsNum
          };
        } );
      } );
      return Promise.all( promises );
    } )
    .then( function listPhases(){
      var promises = _.map( mementos, function( memento ){
        return phasesService.list( memento.assessment.phases )
          .then( function handlePhases( phases ){
            memento.phases = phases;
          } );
      } );
      return Promise.all( promises );
    } )
    .then( function listJudgements(){
      var promises = _.map( mementos, function( memento ){
        return judgementsService.list( {
          comparison : memento.comparison
        } ).then( function handleJudgements( judgements ){
          memento.judgements = judgements;
        } );
      } );
      return Promise.all( promises );
    } )
    .then( function listRepresentations(){
      var judgements = _.reduce( mementos, function( memo,
                                                     memento ){
        return memo.concat( memento.judgements );
      }, [] );

      var promises = _.map( judgements, function( judgement ){
        return representationsService.retrieveFull( {
          _id : judgement.representation
        } )
          .then( function handleRepresentation( representation ){
            judgement.representation = representation.toSafeJSON();
          } );
      } );

      return Promise.all( promises );
    } )
    .then( function listSeqs(){
      var promises = _.map( mementos, function( memento ){
        return seqsService.list( {
          comparison : memento.comparison
        } ).then( function handleSeqs( seqs ){
          if( seqs && seqs.length > 0 ){
            //seqs are optional, and dependant on the worflow defined in the assessment
            memento.seqs = seqs;
          }
        } );
      } );
      return Promise.all( promises );
    } )
    .then( function handleOutput(){
      return mementos;
    } );

};
