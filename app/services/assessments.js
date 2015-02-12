"use strict";
var debug = require( "debug" )( "dpac:services.assessments" );

var keystone = require( "keystone" );
var schema = keystone.list( "Assessment" );
var Service = require( "./helpers/Service" );
var base = new Service( schema );

module.exports.listById = function listById( ids ){
  return base.listByid( ids ).execAsync();
};

module.exports.list = function list( opts ){
  debug( "list" );
  return base.list( opts )
    .sort( "order" )
    .lean()
    .execAsync();
};

/**
 *
 * @param opts
 * @param opts._id Assessment.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieveAssessment( opts ){
  debug( "#retrieve" );

  return base.retrieve( opts )
    .populate( "phases" )
    .lean()
    .execAsync();
};
