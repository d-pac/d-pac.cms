"use strict";
var debug = require( "debug" )( "dpac:services.assessments" );

var _ = require( "underscore" );
var keystone = require( "keystone" );
var schema = keystone.list( "Assessment" );

module.exports.listById = function listById( ids ){
  return module.exports.list( ids );
};

module.exports.list = function list( opts ){
  debug( "list" );
  var query = schema.model
    .find( opts )
    .sort( "order" );

  if( _.isArray( opts ) ){
    query = query.where( "_id" ).in( opts );
  }

  return query.lean().exec();
};
/**
 *
 * @param opts
 * @param opts._id Assessment.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieveAssessment( opts ){
  debug( "#retrieve" );

  return schema.model
    .findById( opts._id )
    .populate( "phases" )
    .lean()
    .exec();
};
