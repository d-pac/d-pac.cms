"use strict";
var debug = require( "debug" )( "dpac:services.comparisons" );
var keystone = require( "keystone" );
var _ = require( "underscore" );
var schema = keystone.list( "Comparison" );
var Service = require( "./helpers/Service" );
var assessmentsService = require( './assessments' );
var representationsService = require( './representations' );
var mailsService = require( './mails' );
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
  var assessmentIds = _.pluck( assessmentObjects, "_id" );
  debug( "#listForAssessments", opts, assessmentIds );
  var self = this;
  return base.list( _.defaults( opts, {
    completed: false
  } ) )
    .where( "assessment" ).in( assessmentIds )
    .execAsync();
};

module.exports.create = function( opts ){
  debug( '#create', opts );

  return P.join(
    representationsService.list( {
      assessment: opts.assessment
    } ),
    this.list( {
      assessment: opts.assessment
    } ),
    assessmentsService.retrieve( {
      _id: opts.assessment
    } ),

    function( representations,
              comparisons,
              assessment ){
      var data;
      var plainRepresentations = _.map(representations, function(doc){
        return JSON.parse(JSON.stringify(doc));
      });
      var plainComparisons = _.map(comparisons, function(doc){
        return JSON.parse(JSON.stringify(doc));
      });
      var plainAssessment = JSON.parse(JSON.stringify(assessment));
      try{
        data = require( assessment.algorithm ).select( plainRepresentations,
          plainComparisons,
          plainAssessment,
          JSON.parse(JSON.stringify(opts.assessor._id)) );
      } catch( error ) {
        console.log( error );
        throw new Error( 'Assessment incorrectly configured, please contact: <a href="mailto:info@d-pac.be">info@d-pac.be</a>' );
      }
      if( data.result && data.result.length ){
        var selectedPair = data.result;

        var repA = _.find(representations, function(rep){
          return rep.id == selectedPair[0]._id;
        });
        var repB = _.find(representations, function(rep){
          return rep.id == selectedPair[1]._id;
        });
        repA.compareWith( repB );
        return base.create( {
          assessment: opts.assessment,
          assessor: opts.assessor._id,
          phase: assessment.phases[ 0 ],
          representations: {
            a: repA.id,
            b: repB.id
          }
        } );
      } else if( data.messages ){

        _.each( data.messages, function( message ){
          switch( message ){
            case "assessor-stage-completed":
              mailsService.sendAssessorStageCompleted( opts.assessor, assessment );
              break;
            case "stage-completed":
              mailsService.sendStageCompleted( assessment );
              break;
          }
        } );
        data.type = "messages";
        return data;
      }
    }
  );
};

module.exports.listRepresentationsForComparisons = function( comparisons ){
  var ids = _.reduce( comparisons, function( memo,
                                             comparison ){
    return memo.concat( _.values( _.pick( comparison.representations, "a", "b", "c", "d" ) ) );
  }, [] );
  return representationsService.listById( ids );
};
