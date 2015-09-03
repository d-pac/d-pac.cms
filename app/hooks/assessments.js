'use strict';
var scheduler = require( 'node-schedule' );
var keystone = require( 'keystone' );
var assessmentsService = require( '../services/assessments' );
var constants = require( '../models/helpers/constants' );

function activateScheduledAssessments(){
  return assessmentsService.list( {
    state: constants.DRAFT,
    'schedule.active': true,
    'schedule.begin': {
      $lte: new Date()
    }
  } ).each( function( assessment ){
    console.log('Scheduler: auto-publishing assessment', assessment.name);
    assessment.state = constants.PUBLISHED;
    assessment.save();
  } );
}

function archiveScheduledAssessments(){
  return assessmentsService.list( {
    state: constants.PUBLISHED,
    'schedule.active': true,
    'schedule.end': {
      $lte: new Date()
    }
  } ).each( function( assessment ){
    console.log('Scheduler: auto-archiving assessment', assessment.name);
    assessment.state = constants.ARCHIVED;
    assessment.schedule.active = false;
    assessment.save();
  } );
}

module.exports.init = function(){

  keystone.post( 'updates', function( done ){
    scheduler.scheduleJob( '0 1 * * * *', function(){ // 0:01 every day
      activateScheduledAssessments().then( function(){
        return archiveScheduledAssessments();
      } );
    } );
    done();
  } );
};
