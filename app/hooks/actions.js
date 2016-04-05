'use strict';

const P = require( 'bluebird' );
const keystone = require( 'keystone' );

const assessmentsService = require( '../services/assessments' );
const service = require( '../services/actions' );
const handleHook = require( './helpers/handleHook' );

function executeAction( action ){

  function failureHandler( err ){
    action.line = "FAILED";
    action.success = false;
    action.log = err;
    return P.resolve();
  }

  const p = assessmentsService.retrieve( { _id: action.assessment } );

  switch( action.actionType ){
    case "reset":
      return p.then( function( assessment ){
          return service.resetAssessment( assessment )
        } )
        .then( function( assessment ){
          action.line = "Assessment: " + assessment.name;
          action.log = "Successfully reset";
          action.success = true;
        } )
        .catch( failureHandler );

    case "clear":
      return p.then( function( assessment ){
          return service.clearAssessment( assessment )
        } )
        .then( function( assessment ){
          action.line = "Assessment: " + assessment.name;
          action.log = "Successfully cleared";
          action.success = true;
        } )
        .catch( failureHandler );

    case "delete":
      return p.then( function( assessment ){
          return service.deleteAssessment( assessment )
        } )
        .then( function( assessment ){
          action.line = "Assessment: " + assessment.name;
          action.log = "Successfully deleted";
          action.success = true;
        } )
        .catch( failureHandler );

    case "archive" :
      return p.then( function( assessment ){
          return service.archiveAssessment( assessment )
        } )
        .then( function( result ){
          action.line = "Assessment: " + result.assessment.name;
          action.log = result.out;
          action.success = true;
        } )
        .catch( failureHandler );

    default:
      return P.reject( new Error( "Unhandled action: " + action.actionType ) );
  }
}

module.exports.init = function(){
  keystone.list( 'Action' ).schema.pre( 'save', handleHook( executeAction ) );
  keystone.list( 'Assessment' ).schema.pre( 'remove', handleHook( ( assessment )=>{
    return service.prepAssessmentForDeletion( assessment );
  } ) );
};

