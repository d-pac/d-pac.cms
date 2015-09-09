'use strict';

var _ = require( 'lodash' );
var keystone = require( 'keystone' );
var P = require( 'bluebird' );

var comparisonsService = require( '../services/comparisons' );
var representationsService = require( '../services/representations' );
var assessmentsService = require( '../services/assessments' );
var usersService = require( '../services/users' );

var Representation = keystone.list( 'Representation' );
var Timelog = keystone.list( 'Timelog' );

function deleteComparison( comparisonId ){
  return comparisonsService.remove( {
    _id: comparisonId.toString()
  } ).then( function( comparison ){
    return P.props( {
      a: representationsService.retrieve( {
        _id: comparison.representations.a.toString()
      } ),
      b: representationsService.retrieve( {
        _id: comparison.representations.b.toString()
      } )
    } );
  } ).then( function( pair ){
    pair.a.uncompareWith( pair.b );
  } );
}

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
      var index = user.assessments.indexOf( assessmentId );
      if( index >= 0 ){
        user.assessments.splice( index, 1 );
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

function deletionCreatedHandler( next ){
  var deletion = this;
  switch( parseInt( deletion.subject ) + parseInt( deletion.removalType ) ){
    case 11:
      resetAssessment( deletion.assessment )
        .then( function( assessment ){
          deletion.result = "Assessment successfully reset: " + assessment.name;
          next();
        } )
        .catch( next );
      break;
    case 12:
      deleteAssessment( deletion.assessment )
        .then( function( assessment ){
          deletion.result = "Assessment successfully removed: " + assessment.name;
          next();
        } )
        .catch( next );
      break;
    case 22:
      deleteComparison( deletion.comparison )
        .then( next )
        .catch( next );
      break;
    default:
      next( new Error( "Unhandled deletion subject: " + deletion.subject ) );
  }
}

module.exports.init = function(){
  keystone.list( 'Deletion' ).schema.pre( 'save', deletionCreatedHandler );
};

