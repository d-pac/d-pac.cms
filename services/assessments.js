'use strict';
var debug = require( 'debug' )( 'dpac:services.assessments' );
var keystone = require( 'keystone' );
var Assessment = keystone.list( 'Assessment' );

/**
 *
 * @param opts
 * @param opts.assessment Assessment.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieveAssessment( opts ){
  debug('#retrieve');
  return Assessment.model
    .findById( opts.assessment )
    .populate( 'phases' )
    .lean()
    .exec();
};
