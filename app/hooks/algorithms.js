/**
 * Created by creynder on 04/10/16.
 */
'use strict';

const _ = require( 'lodash' );
const keystone = require( 'keystone' );
const handleHook = require( './helpers/handleHook' );
const mailsService = require( '../services/mails' );

const messageHandlers = {
  'assessor-stage-completed': function( data ){
    mailsService.sendAssessorStageCompleted( data.assessor, data.assessment );
  },

  'stage-completed': function( data ){
    mailsService.sendStageCompleted( data.assessment );
  },

  'assessment-completed': function( data ){
    data.assessment.state = 'completed';
    data.assessment.save();
  },
};

/**
 *
 * @param {{}} result
 * @param {{}} result.assessment
 * @param {{}} result.assessor
 * @param {{}} result.representations
 * @param {{}} result.comparisons
 * @param {[]} result.messages
 * @param {String} result.phase - phase id
 * @param {String} result.type - type description
 */
function pluginMessage( data ){

  _.forEach( data.messages, function( messageType ){
    const handler = messageHandlers[ messageType ];
    if( !handler ){
      console.error( '[dpac:hooks.algorithms]', `ERROR: Handler for message "${messageType}
         in hook "${data.assessment.algorithm}" not implemented` );
      return;
    }
    handler( data );
  } );

}
module.exports.init = function(){
  keystone.hooks.post( 'plugin.message', pluginMessage );
};
