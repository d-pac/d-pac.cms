'use strict';

var _ = require( 'lodash' );

var mailsService = require( '../services/mails' );
var statsService = require( '../services/stats' );
var representationsService = require( '../services/representations' );

var handlers = {
  messages: function( data ){
    _.each( data.messages, function( message ){
      switch( message ){
        case "assessor-stage-completed":
          mailsService.sendAssessorStageCompleted( data.assessor, data.assessment );
          break;
        case "stage-completed":
          mailsService.sendStageCompleted( data.assessment );
          statsService.estimate( data.representations, data.comparisons );
          break;
        default:
          throw new Error( 'Handler for message "' + message
            + '" in hook "benchmarked-comparative-selection" not implemented' );
      }
    } );
  }
};

module.exports = function( result ){
  handlers[ result.type ].call( this, result );
};
