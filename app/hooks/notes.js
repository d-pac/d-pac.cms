'use strict';

const keystone = require('keystone');
const feedbackService = require('../services/feedback');
const handleHook = require('./helpers/handleHook');

function removeFeedbackForRepresentation(representation){
  return feedbackService.list( {
      representation: representation.id
    } )
    .mapSeries( ( feedback )=>feedback.remove() );
}

module.exports.init = function(){
  keystone.list( 'Representation' ).schema.pre( 'remove', handleHook( removeFeedbackForRepresentation ) );
};
