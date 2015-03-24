"use strict";
var _ = require( "underscore" );
var debug = require( "debug" )( "dpac:services.mementos" );
var async = require( "async" );
var keystone = require( "keystone" );
var errors = require( "errors" );
var Bluebird = require( "bluebird" );

var representationsService = require( "./representations" );
var comparisonsService = require( "./comparisons" );
var assessmentsService = require( "./assessments" );
var phasesService = require( "./phases" );
var requireProp = require( "./helpers/requireProp" );

/**
 *
 * @param opts
 * @param opts.assessor User.id
 * @param opts.assessment Assessment.id
 * @return {Promise}
 */
module.exports.create = function createMemento( opts ){
  debug( "#create" );

  requireProp( opts, "assessor", "assessment" );

  var memento = {
    assessor : opts.assessor
  };

  return assessmentsService.retrieve( {
    _id : opts.assessment
  } ).then( function handleAssessment( assessment ){
    if( !assessment ){
      throw new errors.Http422Error( {
        message     : "Could not create memento.",
        explanation : "Assessment not found."
      } );
    }
    memento.assessment = assessment;
    memento.phases = assessment.phases;
    assessment.phases = _.pluck( assessment.phases, "_id" );
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
    .then( function getRepresentationPair(){
      return representationsService.select( {
        assessment : opts.assessment,
        algorithm  : memento.assessment.algorithm
      } );
    } )
    .then( function handleRepresentations( representations ){
      for( var i = 0, n = representations.length; i < n; i++ ){
        for( var j = i + 1; j < n; j++ ){
          representations[ i ].compareWith( representations[ j ] );
        }
        representations[ i ].save(); // we don't have to wait for this
      }
      memento.representations = representations;
      return _.pluck( representations, "_id" ); //should these be converted to ObjectId's???
    } )
    .then( function createComparison( representations ){
      var firstPhase;

      if( memento.phases && 0 < memento.phases.length ){
        firstPhase = memento.phases[ 0 ];
      }

      return comparisonsService.create( {
        assessor        : opts.assessor,
        assessment      : opts.assessment,
        phase           : firstPhase,
        representations : representations
      } );
    } )
    .then( function handleComparison( comparison ){
      memento.comparison = comparison;
    } )
    .then( function(){
      return memento;
    } );
};

///**
// *
// * @param opts
// * @param opts.assessor User.id
// * @return {Promise}
// */
//module.exports.listActives = function listActives( opts ){
//  debug( "#listActives" );
//  var mementos = [];
//
//  return comparisonsService.listActive( {
//    assessor : opts.assessor
//  } )
//    .then( function handleComparisons( comparisons ){
//      _.each( comparisons, function( comparison ){
//        var memento = {};
//        memento.assessor = comparison.assessor;
//        memento.assessment = comparison.assessment;
//        memento.comparison = comparison;
//        comparison.assessment = comparison.assessment._id;
//        mementos.push( memento );
//      } );
//    } )
//    .then( function getNumOfCompletedComparisons(){
//      var promises = _.map( mementos, function( memento ){
//        return comparisonsService.completedCount( {
//          assessment : memento.assessment._id,
//          assessor   : opts.assessor
//        } ).then( function( completedNum ){
//          memento.progress = {
//            completedNum   : completedNum,
//            comparisonsNum : memento.assessment.comparisonsNum
//          };
//        } );
//      } );
//
//      return Bluebird.all( promises );
//    } )
//    .then( function listPhases(){
//      var promises = _.map( mementos, function( memento ){
//        return phasesService.list( memento.assessment.phases )
//          .then( function handlePhases( phases ){
//            memento.phases = phases;
//          } );
//      } );
//
//      return Bluebird.all( promises );
//    } )
//    .then( function listJudgements(){
//      var promises = _.map( mementos, function( memento ){
//        return judgementsService.list( {
//          comparison : memento.comparison
//        } ).then( function handleJudgements( judgements ){
//          memento.judgements = judgements;
//        } );
//      } );
//
//      return Bluebird.all( promises );
//    } )
//    .then( function listRepresentations(){
//      var judgements = _.reduce( mementos, function( memo,
//                                                     memento ){
//        return memo.concat( memento.judgements );
//      }, [] );
//
//      var promises = _.map( judgements, function( judgement ){
//        return representationsService.retrieveFull( {
//          _id : judgement.representation
//        } )
//          .then( function handleRepresentation( representation ){
//            judgement.representation = representation.toSafeJSON();
//          } );
//      } );
//
//      return Bluebird.all( promises );
//    } )
//    .then( function listSeqs(){
//      var promises = _.map( mementos, function( memento ){
//        return seqsService.list( {
//          comparison : memento.comparison
//        } ).then( function handleSeqs( seqs ){
//          if( seqs && 0 < seqs.length ){
//            // seqs are optional, and dependant on the worflow defined in the assessment
//            memento.seqs = seqs;
//          }
//        } );
//      } );
//
//      return Bluebird.all( promises );
//    } )
//    .then( function handleOutput(){
//      return mementos;
//    } );
//};
