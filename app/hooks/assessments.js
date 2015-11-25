'use strict';
var P = require( 'bluebird' );
var scheduler = require( 'node-schedule' );
var keystone = require( 'keystone' );
var assessmentsService = require( '../services/assessments' );
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

function archiveScheduledAssessments(){
  return assessmentsService.list( {
    state: constants.assessmentStates.PUBLISHED,
    'schedule.active': true,
    'schedule.end': {
      $lte: new Date()
    }
  } ).each( function( assessment ){
    console.log( 'Scheduler: auto-archiving assessment', assessment.name );
    assessment.state = constants.assessmentStates.ARCHIVED;
    assessment.schedule.active = false;
    assessment.save();
  } );
}

function doAssessmentActions(){
  return activateScheduledAssessments()
    .then( function(){
      return archiveScheduledAssessments();
    } );
}

function assessmentSavedHandler( done ){
  var assessment = this;
  if( assessment.state === constants.assessmentStates.COMPLETED ){
    statsService.estimateForAssessment( assessment.id )
      .then( function(){
        return statsService.statsForAssessment( assessment );
      } )
      .then( function( stats ){
        assessment.state = constants.assessmentStates.CALCULATED;
        assessment.stats = stats;
        return assessment;
        //return P.promisify( assessment.save, assessment )();
      } )
      .then( function( doc ){
        done();
      } );
  } else {
    done();
  }
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

  keystone.list( 'Assessment' ).schema.pre( 'save', assessmentSavedHandler );

};
