"use strict";
var debug = require( "debug" )( "dpac:services.comparisons" );
var keystone = require( "keystone" );
var _ = require( "underscore" );
var schema = keystone.list( "Comparison" );
var Service = require( "./helpers/Service" );
var P = require( "bluebird" );
var base = new Service( schema );
module.exports = base.mixin();

module.exports.completedCount = function completedCount( opts ){
  debug( "#completedCount" );
  opts = _.defaults( opts, {
    completed: true
  } );

  return P.promisifyAll(
    schema.model
      .count( opts )
  ).execAsync();
};

module.exports.listForAssessments = function listForAssessments( opts,
                                                                 assessmentObjects ){
  var assessmentIds = _.pluck(assessmentObjects, "_id");
  debug( "#listForAssessments", opts, assessmentIds );
  var self = this;
  return base.list( _.defaults( opts, {
    completed: false
  } ) )
    .where( "assessment" ).in( assessmentIds )
    .execAsync();
};
