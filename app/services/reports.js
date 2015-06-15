"use strict";
var keystone = require( "keystone" );
var _ = require( "underscore" );
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
  return P.promisifyAll( Representation.model
      .find()
      .where( "assessment" ).in( assessmentIds )
      .populate( 'document', 'name' )
      .populate( 'assessment', 'name' )
  ).execAsync();
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

function getTimelog( map,
                     comparisonId,
                     phase ){
  if( map[ comparisonId ] ){
    return map[ comparisonId ][ phase ] || UNDEFINED;
  }

  return UNDEFINED;
}

function getDocument( map,
                      representationModel ){
  if( !representationModel || !representationModel.document ){
    return UNDEFINED;
  }
  var document = map[ representationModel.document.toString() ];
  return document
    ? document.name
    : UNDEFINED;
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
          memo[ comparisonId ][ phase ] += timelog.duration;
          return memo;
        }, timelogsByComparison );
    } ).then( function(){
      return _.map( comparisonsList, function( comparisonModel ){
        var comparisonId = comparisonModel.id.toString();
        return {
          comparison: comparisonModel._rid,
          assessment: assessmentsById[ comparisonModel.assessment.toString() ].name,
          assessor: comparisonModel.assessor.email,
          "representation A": getDocument( documentsById, comparisonModel.representations.a ),
          "representation B": getDocument( documentsById, comparisonModel.representations.b ),
          "selected representation": getDocument( documentsById, comparisonModel.data.selection ),
          "completed": (comparisonModel.completed)
            ? TRUE
            : FALSE,
          "comparative feedback": (comparisonModel.data.comparative)
            ? comparisonModel.data.comparative.replace( /(?:\r\n|\r|\n)/g, "\u21A9" ).replace( /"/g, "'" )
            : LEFT_EMPTY,
          "selection SEQ": comparisonModel.data[ 'seq-selection' ] || NIL,
          "comparative SEQ": comparisonModel.data[ 'seq-comparative' ] || NIL,
          "selection duration": getTimelog( timelogsByComparison, comparisonId, 'selection' ),
          "selection SEQ duration": getTimelog( timelogsByComparison, comparisonId, 'seq-selection' ),
          "comparative feedback duration": getTimelog( timelogsByComparison, comparisonId, 'comparative' ),
          "comparative feedback SEQ duration": getTimelog( timelogsByComparison, comparisonId, 'seq-comparative' ),
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
        assessment: representationModel.assessment.name,
        name: representationModel.document.name,
        ability: representationModel.ability.value,
        se: representationModel.ability.se,
        rankType: representationModel.rankType
      };
    } );
};
