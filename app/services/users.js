"use strict";

var keystone = require( "keystone" );
var _ = require( "underscore" );
var debug = require( "debug" )( "dpac:services.users" );
var schema = keystone.list( "User" );
var Service = require( "./helpers/Service" );
var assessmentsService = require( "./assessments" );
var comparisonsService = require( "./comparisons" );

var base = new Service( schema );
module.exports = base.mixin();

/**
 *
 * @param opts
 * @param opts._id schema.id
 * @returns {Promise}
 */
module.exports.list = function list( opts ){
  debug( "#list", opts );

  return base.list( opts )
    .execAsync();
};


module.exports.listAssessments = function listAssessments( opts ){
  debug( "#listAssessments" );
  return this.retrieve( opts )
    .then( function( user ){
      return assessmentsService.listById( user.assessments );
    } ).map(function(assessment){
      assessment = assessment.toJSON();// necessary, otherwise the added `completedNum` won't stick
      return comparisonsService.completedCount({
        assessment: assessment._id,
        assessor: opts._id
      }).then(function(count){
        assessment.completedNum = count;
        return assessment;
      });
    }).filter(function(assessment){
      return assessment.comparisonsNum.total > assessment.completedNum;
    });
};

module.exports.listComparisons = function listComparisons( opts ){
  return this.listAssessments( opts )
    .then( function( assessments ){
      return comparisonsService.listForAssessments( {
        assessor: opts._id
      }, assessments );
    } );
};

module.exports.update = function update( opts ){
  debug( "#update" );
  return base.update( this.retrieve( opts ), opts )
    .execAsync();
};
