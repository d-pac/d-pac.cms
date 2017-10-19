'use strict';

const P = require( 'bluebird' );
var _ = require( 'lodash' );
var keystone = require( 'keystone' );
// var algorithm = require( 'benchmarked-comparative-selection' );
//
var statsService = require( '../services/stats' );
var assessmentsService = require( '../services/assessments' );

const handleHook = require( './helpers/handleHook' );

function pluginMessage(data ){
  _.forEach(data.messages, function (messageType) {
    if(messageType === 'stage completed'){
      statsService.estimate( data.representations, data.comparisons );
    }
  });
}

function comparisonSelectionChanged( comparison, diff, done ){
  return assessmentsService.retrieve( {
      _id: comparison.assessment
    } )
    .then( function( assessment ){
      //TODO: we need to extract this out here, and move it to the benchmark algorithm, with a hook or something
      if( assessment.algorithm === 'benchmarked-comparative-selection' && assessment.stage === 1 ){
        return statsService.estimateForAssessmentId( assessment.id );
      }
    } )
    .asCallback(done);
}

// module.exports.init = function(){
//   keystone.hooks.post('plugin.message', pluginMessage);
//   keystone.list( 'Comparison' ).events.on( 'change:data.selection', comparisonSelectionChanged );
// };
