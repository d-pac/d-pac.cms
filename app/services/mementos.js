"use strict";
var _ = require( "underscore" );
var debug = require( "debug" )( "dpac:services.mementos" );
var async = require( "async" );
var keystone = require( "keystone" );
var errors = require( "errors" );
var P = require( "bluebird" );

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
        comparisonsNum : memento.assessment.comparisonsNum.total
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

/**
 *
 * @param opts
 * @param opts.assessor User.id
 * @return {Promise}
 */
module.exports.list = function listActives( opts ){
  debug( "#list" );
  requireProp( opts, "assessor" );
  var mementos = [];

  return comparisonsService.list( {
    assessor  : opts.assessor,
    completed : false
  } ).then( function handleComparisons( comparisons ){
    _.each( comparisons, function( comparison ){
      var memento = {};
      memento.assessor = comparison.assessor;
      memento.assessment = comparison.assessment;
      memento.comparison = comparison;
      mementos.push( memento );
    } );
  } ).then( function handleRelationships(){
    var promises = [];
    _.each( mementos, function( memento ){
      promises.push( comparisonsService.completedCount( {
        assessment : memento.assessment._id,
        assessor   : opts.assessor
      } ).then( function( completedNum ){
        memento.progress = {
          completedNum   : completedNum,
          comparisonsNum : memento.assessment.comparisonsNum.total
        };
      } ) );
      promises.push( phasesService.list( memento.assessment.phases )
        .then( function handlePhases( phases ){
          memento.phases = phases;
        } ) );
      promises.push( representationsService.listById( [
        memento.comparison.representations.a, memento.comparison.representations.b
      ] )
        .then( function handleRepresentations( representations ){
          memento.representations = representations;
        } ) );
    } );
    return P.all( promises );
  } ).then( function handleOutput(){
    return mementos;
  } );
};
