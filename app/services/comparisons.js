"use strict";
var debug = require( "debug" )( "dpac:services.comparisons" );
var keystone = require( "keystone" );
var _ = require( "lodash" );
var P = require( "bluebird" );

var collection = keystone.list( "Comparison" );
var Service = require( "./helpers/Service" );
var assessmentsService = require( './assessments' );
var documentsService = require('./documents');
var representationsService = require( './representations' );

var base = new Service( collection );
module.exports = base.mixin();

module.exports.listPopulated = ( opts ) =>{
  return base.list( opts )
    .populate( 'representations.a representations.b' )
    .exec();
};

module.exports.completedCount = function completedCount( opts ){
  debug( "#completedCount" );
  opts = _.defaults( opts, {
    completed: true
  } );

  return base.count( opts ).exec();
};

module.exports.listForAssessments = function listForAssessments( opts,
                                                                 assessmentIds ){
  debug( "#listForAssessments", opts, assessmentIds );
  var self = this;
  return base.list( opts )
    .where( "assessment" ).in( assessmentIds )
    .exec();
};

module.exports.listForRepresentation = function listForRepresentation( representation ){
  //return base.list({})
  //  .where( { "representations.a": representation.id } )
  //  //.or( [ { "representations.b": representation.id } ] )
  //  .exec();
  return base.list( {
    $or: [
      { "representations.a": representation.id },
      { "representations.b": representation.id }
    ]
  } ).exec();
};

module.exports.create = function( opts ){
  debug( '#create', opts );

  return P.join(
    representationsService.listWithoutUser( opts.assessor.id, {
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
      var plainComparisons = JSON.parse( JSON.stringify( comparisons ) );
      var plainRepresentations = JSON.parse( JSON.stringify( representations ) );
      var plainAssessment = JSON.parse( JSON.stringify( assessment ) );
      try{
        data = require( assessment.algorithm ).select( {
          representations: plainRepresentations,
          comparisons: plainComparisons,
          assessment: plainAssessment,
          assessor: JSON.parse( JSON.stringify( opts.assessor._id ) )
        } );
      } catch( error ) {
        console.log( error );
        throw new Error( 'assessment-incorrectly-configured' );
      }

      var p, hookData;

      if( data.result && data.result.length ){
        var selectedPair = ( keystone.get( "disable selection shuffle" ) )
          ? data.result
          : _.shuffle( data.result );

        var repA = _.find( representations, function( rep ){
          return rep.id == selectedPair[ 0 ]._id;
        } );
        var repB = _.find( representations, function( rep ){
          return rep.id == selectedPair[ 1 ]._id;
        } );
        hookData = selectedPair;
        p = base.create( {
            assessment: opts.assessment,
            assessor: opts.assessor._id,
            phase: assessment.phases[ 0 ],
            representations: {
              a: repA.id,
              b: repB.id
            }
          } )
          .then( function( comparison ){
            comparison.representations.a = repA;
            comparison.representations.b = repB;
            return comparison;
          } );
      } else if( data.messages ){
        data.type = "messages";
        hookData = _.defaults( {
          assessor: opts.assessor,
          assessment: assessment,
          representations: {
            documents: representations,
            objects: plainRepresentations
          },
          comparisons: {
            documents: comparisons,
            objects: plainComparisons
          }
        }, data );
        p = P.resolve( data );
      }
      return p.then( function( output ){
        keystone.hooks.callHook( 'post:' + assessment.algorithm + '.select', hookData );
        return output;
      } );
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
