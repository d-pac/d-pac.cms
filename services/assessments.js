'use strict';
var debug = require( 'debug' )( 'dpac:services.assessments' );
var keystone = require( 'keystone' );
var Assessment = keystone.list( 'Assessment' );

/**
 *
 * @param opts
 * @param opts._id Assessment.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieveAssessment( opts ){
  debug('#retrieve');
  return Assessment.model
    .findById( opts._id )
    .populate( 'phases' )
    .lean()
    .exec();
};
