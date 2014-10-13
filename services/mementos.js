'use strict';
var _ = require( 'underscore' );
var debug = require( 'debug' )( 'dpac:services.mementos' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var errors = require( 'errors' );

var representations = require( './representations' );
var judgements = require( './judgements' );
var comparisons = require( './comparisons' );
var assessments = require( './assessments' );
var phases = require( './phases' );
var seqs = require( './seqs' );
var timelogs = require('./timelogs');

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
  return assessments.retrieve( { assessment : opts.assessment } )
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
    .then( function(){
      return representations.retrievePair();
    } )
    .then( function handleRepresentations( representations ){
      //todo: when no representations found
      memento.representations = representations;
    } )
    .then( function(){
      var firstPhase;
      if( memento.phases && memento.phases.length > 0 ){
        firstPhase = memento.phases[0];
      }
      return comparisons.create( {
        assessor   : opts.assessor,
        assessment : opts.assessment,
        phase      : firstPhase
      } );
    } )
    .then( function handleComparison( comparison ){
      memento.comparison = comparison;
    } )
    .then( function(){
      return judgements.create( {
        assessor        : opts.assessor,
        assessment      : opts.assessment,
        representations : memento.representations,
        comparison      : memento.comparison
      } );
    } )
    .then( function handleJudgements( judgements ){
      memento.judgements = judgements;
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

  return (function retrieveComparisons(){
    return comparisons.listActive( { assessor : opts.assessor } )
      .then( function handleComparisons( comparisons ){
        _.each( comparisons, function( comparison ){
          var memento = {};
          memento.assessor = comparison.assessor;
          memento.assessment = comparison.assessment;
          memento.comparison = comparison;
          comparison.assessment = comparison.assessment._id;
          mementos.push( memento );
        } );
      } );
  })()
    .then( function listPhases(){
      var promise;
      _.each( mementos, function( memento ){
        var p = phases.list( memento.assessment.phases )
          .then( function handlePhases( phases ){
            memento.phases = phases;
          } );
        promise = ( promise )
          ? promise.chain( p )
          : p;
      } );
      return promise;
    } )
    .then( function listJudgements(){
      var promise;
      _.each( mementos, function( memento ){
        var p = judgements.list( {
          comparison : memento.comparison
        } ).then( function handleJudgements( judgements ){
          memento.judgements = judgements;
        } );
        promise = ( promise )
          ? promise.chain( p )
          : p;
      } );
      return promise;
    } )
    .then( function listRepresentations(){
      var promise;
      _.each( mementos, function( memento ){
        var ids = _.pluck( memento.judgements, "representation" );
        var p = representations.list( ids )
          .then( function handleRepresentations( representations ){
            memento.representations = representations;
          } );
        promise = ( promise )
          ? promise.chain( p )
          : p;
      } );
      return promise;
    } )
    .then( function listSeqs(){
      var promise;
      _.each( mementos, function( memento ){
        var p = seqs.list( {
          comparison : memento.comparison
        } ).then( function handleSeqs( seqs ){
          if( seqs && seqs.length > 0 ){
            //seqs are optional, and dependant on the worflow defined in the assessment
            memento.seqs = seqs;
          }
        } );
        promise = ( promise )
          ? promise.chain( p )
          : p;
      } );
      return promise;
    } )
    .then( function listTimelogs(){
      var promise;
      _.each( mementos, function( memento ){
        var p = timelogs.list( {
          comparison : memento.comparison
        } ).then( function handleTimelogs( docs ){
          memento.timelogs = docs;
        } );
        promise = ( promise )
          ? promise.chain( p )
          : p;
      } );
      return promise;
    })
    .then( function handleOutput(){
      return mementos;
    } );

};
