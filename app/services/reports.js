"use strict";
var keystone = require( "keystone" );
var _ = require( "lodash" );
var fs = require( "fs" );
var P = require( 'bluebird' );

var Comparison = keystone.list( "Comparison" );
var Representation = keystone.list( "Representation" );
var assessmentsService = require( './assessments' );
var documentsService = require( './documents' );
var timelogsService = require( './timelogs' );

var LEFT_EMPTY = "empty";
var UNDEFINED = "N/A";
var TRUE = 1;
var FALSE = 0;
var NIL = -1;

module.exports.listRepresentationsForAssessmentIds = function listRepresentationsForAssessmentIds( assessmentIds ){
  var q = Representation.model
    .find()
    .populate( 'document', 'name' )
    .populate( 'assessment', 'name' );
  if( assessmentIds ){
    if( _.isString( assessmentIds ) ){
      assessmentIds = [ assessmentIds ];
    }
    q = q.where( "assessment" ).in( assessmentIds );
  }
  return P.promisifyAll( q ).execAsync().then( function( result ){
    return result;
  } );
};

module.exports.listComparisonsForAssessmentIds = function listComparisonsForAssessmentIds( assessmentIds ){
  return P.promisifyAll( Comparison.model
      .find()
      .where( "assessment" ).in( assessmentIds )
      .populate( "assessor" )
      .populate( 'representations.a' )
      .populate( 'representations.b' )
      .populate( 'data.selection' )
  ).execAsync();
};

function getDocument( map,
                      representationModel ){
  return _.get( map, [ _.get( representationModel, 'document', '' ).toString(), 'name' ], UNDEFINED );
}

module.exports.listComparisons = function listComparisons( assessmentIds ){
  var documentsById = {};
  var assessmentsById = {};
  var comparisonsList = [];
  var timelogsByComparison = {};
  return documentsService.list()
    .reduce( function( memo,
                       document ){
      memo[ document.id.toString() ] = document;
      return memo;
    }, documentsById )
    .then( function(){
      var opts = { state: { $ne: null } };
      var p = (assessmentIds)
        ? assessmentsService.listById( assessmentIds, opts )
        : assessmentsService.list( opts );
      return p.reduce( function( memo,
                                 assessment ){
        memo[ assessment.id.toString() ] = assessment;
        return memo;
      }, assessmentsById );
    } )
    .then( function(){
      return module.exports.listComparisonsForAssessmentIds( _.keys( assessmentsById ) );
    } ).then( function( comparisons ){
      return comparisonsList = comparisons;
    } ).then( function( comparisons ){
      return timelogsService
        .listForComparisonIds( null, _.pluck( comparisons, "_id" ) )
        .reduce( function( memo,
                           timelog ){
          var comparisonId = timelog.comparison.toString();
          var phase = timelog.phase.slug;
          if( !memo[ comparisonId ] ){
            memo[ comparisonId ] = {};
          }
          if( !memo[ comparisonId ][ phase ] ){
            memo[ comparisonId ][ phase ] = 0;
          }
          memo[ comparisonId ][ phase ] = timelog.duration;
          return memo;
        }, timelogsByComparison );
    } ).then( function(){
      return _.map( comparisonsList, function( comparisonModel ){
        var comparisonId = comparisonModel.id.toString();
        return {
          comparison: comparisonModel._rid,
          assessment: _.get( assessmentsById, [ _.get( comparisonModel, 'assessment', '' ).toString(), 'name' ] ),
          assessor: _.get( comparisonModel, 'assessor.email', UNDEFINED ),
          "representation A": getDocument( documentsById, _.get( comparisonModel, 'representations.a' ) ),
          "representation B": getDocument( documentsById, _.get( comparisonModel, 'representations.b' ) ),
          "selected representation": getDocument( documentsById, _.get( comparisonModel, 'data.selection' ) ),
          "completed": (comparisonModel.completed)
            ? TRUE
            : FALSE,
          "comparative feedback": _.get( comparisonModel, 'data.comparative', '' ).replace( /(?:\r\n|\r|\n)/g, "\u21A9" ).replace( /"/g, "'" ),
          "selection SEQ": _.get( comparisonModel, 'data.seq-selection', NIL ),
          "comparative SEQ": _.get( comparisonModel, 'data.seq-comparative', NIL ),
          "selection duration": _.get( timelogsByComparison, [ comparisonId, 'selection' ], UNDEFINED ),
          "selection SEQ duration": _.get( timelogsByComparison, [ comparisonId, 'seq-selection' ], UNDEFINED ),
          "comparative feedback duration": _.get( timelogsByComparison, [ comparisonId, 'comparative' ], UNDEFINED ),
          "comparative feedback SEQ duration": _.get( timelogsByComparison, [
            comparisonId, 'seq-comparative'
          ], UNDEFINED ),
          "total": _.reduce( timelogsByComparison[ comparisonId ], function( memo,
                                                                             value ){
            return memo + value;
          }, 0 )
        };
      } );
    } );
};

module.exports.listRepresentations = function listRepresentations( assessmentIds ){
  return module.exports.listRepresentationsForAssessmentIds( assessmentIds )
    .map( function( representationModel ){
      return {
        assessment: _.get( representationModel, 'assessment.name', '' ),
        name: _.get( representationModel, 'document.name', '' ),
        ability: _.get( representationModel, 'ability.value', UNDEFINED ),
        se: _.get( representationModel, 'ability.se', UNDEFINED ),
        rankType: representationModel.rankType || UNDEFINED
      };
    } );
};
