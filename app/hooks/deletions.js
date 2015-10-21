'use strict';

var _ = require( 'lodash' );
var keystone = require( 'keystone' );
var P = require( 'bluebird' );
var path = require( 'path' );
var exec = P.promisify( require( 'child_process' ).exec );
var moment = require( 'moment' );
var url = require( 'url' );

var comparisonsService = require( '../services/comparisons' );
var representationsService = require( '../services/representations' );
var assessmentsService = require( '../services/assessments' );
var usersService = require( '../services/users' );
var constants = require( '../models/helpers/constants' );

var Representation = keystone.list( 'Representation' );
var Timelog = keystone.list( 'Timelog' );

var dumpCommandTpl = _.template( 'mongodump ' +
  '--host {{host}} ' +
  '--db {{db}} ' +
  "--out '{{out}}' " +
  '--collection {{collection}} ' +
  "--query '{{query}}'", {
  interpolate: /{{([\s\S]+?)}}/g
} );

function deleteAssessmentAssociates( assessmentId ){
  return comparisonsService.list( {
      assessment: assessmentId.toString()
    } )
    .each( function( comparison ){
      return P.promisify( comparison.remove, comparison )();
    } )
    .then( function( comparisonsList ){
      return _.pluck( comparisonsList, "id" );
    } )
    .then( function( comparisonIds ){
      return P.promisify( Timelog.model.remove, Timelog.model )( {
        comparison: {
          $in: comparisonIds
        }
      } );
    } );
}

function resetAssessment( assessmentId ){
  return deleteAssessmentAssociates( assessmentId )
    .then( function(){
      return representationsService.list( {
        assessment: assessmentId
      } );
    } )
    .each( function( representation ){
      representation.compared = [];
      return P.promisify( representation.save, representation )();
    } )
    .then( function(){
      return assessmentsService.retrieve( {
        _id: assessmentId.toString()
      } );
    } );
}

function removeAssessmentFromUser( assessmentId,
                                   user,
                                   fieldName ){
  var index = _.get( user, "assessments." + fieldName, [] ).indexOf( assessmentId );
  if( index >= 0 ){
    user.assessments[ fieldName ].splice( index, 1 );
    return true;
  }
  return false;
}

function deleteAssessment( assessmentId ){
  return deleteAssessmentAssociates( assessmentId )
    .then( function(){
      return P.promisify( Representation.model.remove, Representation.model )( {
        assessment: assessmentId
      } );
    } )
    .then( function(){
      return usersService.list();
    } )
    .reduce( function( memo,
                       user ){
      if( removeAssessmentFromUser( assessmentId, user, 'assessor' )
        || removeAssessmentFromUser( assessmentId, user, 'assessee' ) ){
        memo.push( user );
      }
      return memo;
    }, [] )
    .each( function( user ){
      return P.promisify( user.save, user )();
    } )
    .then( function(){
      return assessmentsService.remove( {
        _id: assessmentId.toString()
      } );
    } );
}

function archiveAssessment( assessmentId ){
  var uriObj = url.parse( keystone.get( 'mongo' ), false, true );
  var baseArgs = {
    host: uriObj.host,
    db: uriObj.pathname.substring( 1 )
  };
  var assessment;
  var result = '';
  return assessmentsService.retrieve( { _id: assessmentId.toString() } )
    .then( function( doc ){
      assessment = doc;
      baseArgs.out = path.resolve( path.join( constants.directories.archive, doc.name
        + '-' + moment().format( 'YYYYMMDD-HHmmss' ) ) );
    } )
    .then( function(){
      return comparisonsService.list( {
          assessment: assessmentId.toString()
        } )
        .then( function( comparisonsList ){
          return _.pluck( comparisonsList, "id" );
        } );
    } )
    .map( function( id ){
      return {
        $oid: id
      };
    } )
    .then( function( comparisonIds ){
      var command = dumpCommandTpl( _.defaults( {}, baseArgs, {
        collection: 'timelogs',
        query: JSON.stringify( {
          comparison: { $in: comparisonIds }
        } )
      } ) );

      result += command + '<br/>';
      return exec( command ).spread( function( stdout,
                                               stderr ){
        result += stdout;
      } );
    } )
    .then( function(){
      var command = dumpCommandTpl( _.defaults( {}, baseArgs, {
        collection: 'assessments',
        query: JSON.stringify( {
          _id: { $oid: assessmentId.toString() }
        } )
      } ) );

      result += command + '<br/>';
      return exec( command ).spread( function( stdout,
                                               stderr ){
        result += stdout;
      } );
    } )
    .then( function(){
      var command = dumpCommandTpl( _.defaults( {}, baseArgs, {
        collection: 'representations',
        query: JSON.stringify( {
          assessment: { $oid: assessmentId.toString() }
        } )
      } ) );

      result += command + '<br/>';
      return exec( command ).spread( function( stdout,
                                               stderr ){
        result += stdout;
      } );
    } )
    .then( function(){
      var command = dumpCommandTpl( _.defaults( {}, baseArgs, {
        collection: 'comparisons',
        query: JSON.stringify( {
          assessment: { $oid: assessmentId.toString() }
        } )
      } ) );

      result += command + '<br/>';
      return exec( command ).spread( function( stdout,
                                               stderr ){
        result += stdout;
      } );
    } )
    .then( function(){
      return deleteAssessment( assessmentId );
    } )
    .then( function(){
      return {
        out: result,
        assessment: assessment
      };
    } );
}

function deletionCreatedHandler( next ){
  var deletion = this;

  function failureHandler( err ){
    deletion.line = "FAILED";
    deletion.success = false;
    deletion.log = err;
    next();
  }

  switch( deletion.removalType ){
    case "reset":
      resetAssessment( deletion.assessment )
        .then( function( assessment ){
          deletion.line = "Assessment: " + assessment.name;
          deletion.log = "Successfully reset";
          deletion.success = true;
          next();
        } )
        .catch( failureHandler );
      break;
    case "delete":
      deleteAssessment( deletion.assessment )
        .then( function( assessment ){
          deletion.line = "Assessment: " + assessment.name;
          deletion.log = "Successfully deleted";
          deletion.success = true;
          next();
        } )
        .catch( failureHandler );
      break;
    case "archive":
      archiveAssessment( deletion.assessment )
        .then( function( result ){
          deletion.line = "Assessment: " + result.assessment.name;
          deletion.log = result.out;
          deletion.success = true;
          next();
        } )
        .catch( failureHandler );
      break;
    default:
      next( new Error( "Unhandled deletion action: " + deletion.removalType ) );
  }
}

module.exports.init = function(){
  keystone.list( 'Deletion' ).schema.pre( 'save', deletionCreatedHandler );
};

