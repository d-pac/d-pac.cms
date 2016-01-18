'use strict';
var _ = require( 'lodash' );
var keystone = require( 'keystone' );
var algorithm = require( 'benchmarked-comparative-selection' );

var mailsService = require( '../services/mails' );
var statsService = require( '../services/stats' );
var representationsService = require( '../services/representations' );
var assessmentsService = require( '../services/assessments' );

var handlers = {
  messages: function( data ){
    _.forEach( data.messages, function( message ){
      switch( message ){
        case algorithm.constants.messages.ASSESSOR_STAGE_COMPLETED:
          mailsService.sendAssessorStageCompleted( data.assessor, data.assessment );
          break;
        case algorithm.constants.messages.STAGE_COMPLETED:
          mailsService.sendStageCompleted( data.assessment );
          statsService.estimate( data.representations, data.comparisons );
          break;
        case algorithm.constants.messages.ASSESSMENT_COMPLETED:
          data.assessment.state = 'completed';
          data.assessment.save();
          break;
        default:
         console.error( '[dpac:hooks.benchmarked-comparative-selection]', 'ERROR: Handler for message "' + message
            + '" in hook "benchmarked-comparative-selection" not implemented' );
      }
    } );
  }
};

function representationsSelectedHandler( result ){
  var handler = handlers[ result.type ];
  if( handler ){
    handler.call( this, result );
  }
}

function comparisonSavedHandler(){
  var comparison = this;
  if( comparison.__original && !comparison.__original.completed && comparison.completed ){
    assessmentsService.retrieve( {
      _id: comparison.assessment
    } ).then( function( assessment ){
      if( assessment.algorithm === 'benchmarked-comparative-selection' && assessment.stage === 1 ){
        statsService.estimateForAssessment( assessment.id );
      }
    } );
  }
}

module.exports.init = function(){
  keystone.hooks.post( 'benchmarked-comparative-selection.select', representationsSelectedHandler );
  keystone.list( 'Comparison' ).schema.post( 'save', comparisonSavedHandler );
};
