'use strict';

const P = require( 'bluebird' );
var _ = require( 'lodash' );
var keystone = require( 'keystone' );
var algorithm = require( 'positioned-comparative-selection' );

var mailsService = require( '../services/mails' );
var statsService = require( '../services/stats' );
var assessmentsService = require( '../services/assessments' );

const handleHook = require( './helpers/handleHook' );

//TODO: this must be run regardless of the algorithm -> refactor, see also hooks/benchmarked-comparative-selection
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
          console.error( '[dpac:hooks.positioned-comparative-selection]', 'ERROR: Handler for message "' + message
            + '" in hook "positioned-comparative-selection" not implemented' );
      }
    } );
  }
};

function representationsSelectedHandler( result ){
  var handler = handlers[ result.type ];
  if( handler ){
    handler.call( this, result ); //eslint-disable-line no-invalid-this
  }
}

function recalculateMiddleBox( assessment ){
}

module.exports.init = function(){
  keystone.hooks.post( 'positioned-comparative-selection.select', representationsSelectedHandler );
  keystone.list( 'Assessment' ).schema.post( 'save', handleHook( recalculateMiddleBox ) );
};
