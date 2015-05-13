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
                                                                 assessments ){
  debug( "#listForAssessments", opts );
  var self = this;
  return base.list( opts )
    .where( "assessment" ).in( _.pluck( assessments, "_id" ) )
    .execAsync()
    .map( function( comparison ){
      comparison = comparison.toJSON();
      return self.completedCount( {
        assessment: comparison.assessment,
        assessor: comparison.assessor
      } ).then( function( count ){
        var assessment = _.find( assessments, function( assessment ){
          return assessment.id == comparison.assessment; //MUST BE `.id` and `==` [!]
        } );
        comparison.progress = {
          total: assessment.comparisonsNum.total,
          completed: count
        };
        return comparison;
      } );
    } );
};
