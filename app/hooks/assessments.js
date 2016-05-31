'use strict';

const _ = require( 'lodash' );
var P = require( 'bluebird' );
var scheduler = require( 'node-schedule' );
var keystone = require( 'keystone' );
const assessmentsService = require( '../services/assessments' );
const representationsService = require( '../services/representations' );
const usersService = require( '../services/users' );
const comparisonsService = require( '../services/comparisons' );
var statsService = require( '../services/stats' );
var constants = require( '../models/helpers/constants' );

function activateScheduledAssessments(){
  return assessmentsService.list( {
    state: constants.assessmentStates.DRAFT,
    'schedule.active': true,
    'schedule.begin': {
      $lte: new Date()
    }
  } ).each( function( assessment ){
    console.log( 'Scheduler: auto-publishing assessment', assessment.name );
    assessment.state = constants.assessmentStates.PUBLISHED;
    assessment.save();
  } );
}

function completeScheduledAssessments(){
  return assessmentsService.list( {
    state: { $ne: constants.assessmentStates.COMPLETED },
    'schedule.active': true,
    'schedule.end': {
      $lte: new Date()
    }
  } ).each( function( assessment ){
    console.log( 'Scheduler: auto-completing assessment', assessment.name );
    assessment.state = constants.assessmentStates.COMPLETED;
    assessment.schedule.active = false;
    assessment.save();
  } );
}

function doAssessmentActions(){
  return activateScheduledAssessments()
    .then( function(){
      return completeScheduledAssessments();
    } );
}

function calculateStats( assessment ){
  return statsService.estimateForAssessment( assessment.id )
    .then( function(){
      return statsService.statsForAssessment( assessment );
    } )
    .then( function( stats ){
      assessment.actions.calculate = false;
      assessment.stats = stats;
      assessment.stats.lastRun = Date.now();
      return assessment;
    } );
}

function updateComparisonsNum( assessmentIds ){
  return P.each( assessmentIds, ( assessmentId )=>{
    return comparisonsService.count( {
        assessment: assessmentId
      } )
      .then( ( n )=>{
        return assessmentsService.collection.model.update( { _id: assessmentId }, { 'cache.comparisonsNum': n } );
      } );
  } );
}

function updateRepresentationsNum( assessmentIds ){
  return P.each( assessmentIds, ( assessmentId )=>{
    return representationsService.countToRanks( {
        assessment: assessmentId
      } )
      .then( ( n )=>{
        return assessmentsService.collection.model.update( { _id: assessmentId }, { 'cache.representationsNum': n } );
      } );
  } );
}

function updateAssessorsNum( assessmentIds ){
  return P.each( assessmentIds, ( assessmentId )=>{
    return usersService.countInAssessment( 'assessor', assessmentId )
      .then( ( n )=>{
        return assessmentsService.collection.model.update( { _id: assessmentId }, { 'cache.assessorsNum': n } );
      } );
  } );
}

module.exports.init = function(){

  keystone.post( 'updates', function( done ){
    //0:01 every day
    scheduler.scheduleJob( '0 1 * * *', doAssessmentActions );
    doAssessmentActions()
      .catch( function( err ){
        console.log( 'Scheduled assessment actions failure:' + err );
      } );
    done();//call immediately, we don't want to wait on this!
  } );

  assessmentsService.collection.events.on( 'change:actions', ( doc,
                                                               diff,
                                                               done ) =>{
    if( _.get( doc, [ 'actions', 'calculate' ], false ) ){
      calculateStats( doc ).asCallback( done );
    } else {
      done();
    }
  } );

  comparisonsService.collection.events.on( 'changed:assessment', ( comparison )=>updateComparisonsNum( [ comparison.assessment ] ) );
  comparisonsService.collection.schema.post( 'remove', ( comparison )=>updateComparisonsNum( [ comparison.assessment ] ) );

  representationsService.collection.events.on( 'changed:assessment', ( representation )=>updateRepresentationsNum( [ representation.assessment ] ) );
  representationsService.collection.events.on( 'changed:rankType', ( representation )=>updateRepresentationsNum( [ representation.assessment ] ) );
  representationsService.collection.schema.post( 'remove', ( representation )=>updateRepresentationsNum( [ representation.assessment ] ) );

  usersService.collection.events.on( 'changed:assessments.assessor', ( user,
                                                                       diff )=>{
    return updateAssessorsNum( _.xor( diff.original, diff.updated ) );
  } );
  usersService.collection.schema.post( 'remove', ( user )=>{
    return updateAssessorsNum( user.assessments.assessor || [] );
  } );
};
