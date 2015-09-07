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
var phasesService = require( './phases' );

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

function getComparisonsList( assessmentIds ){
  var p = Comparison.model
    .find()
    .populate( "assessor" )
    .populate( 'representations.a' )
    .populate( 'representations.b' )
    .populate( 'data.selection' );
  if( assessmentIds ){
    assessmentIds = (_.isString( assessmentIds ))
      ? [ assessmentIds ]
      : assessmentIds;
    p = p.where( "assessment" ).in( assessmentIds );
  }
  return P.promisify( p.exec, p )();
}

function getDocument( map,
                      representationModel ){
  return _.get( map, [ _.get( representationModel, 'document', '' ).toString(), 'name' ], UNDEFINED );
}

function createMap( memo,
                    item ){
  var id = item.id.toString();
  memo[ id ] = item;
  return memo;
}

function getPhasesMap(){
  return phasesService
    .list()
    .reduce( createMap, {} );
}

function getDocumentsMap(){
  return documentsService
    .list()
    .reduce( createMap, {} );
}

function getAssessmentsMap( assessmentIds ){
  var opts = { state: { $ne: null } };
  var p = (assessmentIds)
    ? assessmentsService.listById( assessmentIds, opts )
    : assessmentsService.list( opts );
  return p.reduce( createMap, {} );
}

function getTimelogsMap( comparisonIds,
                         phasesMap ){
  return timelogsService
    .listForComparisonIds( null, comparisonIds )
    .reduce( function( memo,
                       timelog ){
      var comparisonId = timelog.comparison.toString();
      _.set( memo, comparisonId + "." + timelog.phase.slug, timelog.duration );
      return memo;
    }, {} );
}

function createComparisonsReportData( phasesMap,
                                      documentsMap,
                                      assessmentsMap,
                                      comparisonsList ){
  return function( timelogsMap ){
    return _.map( comparisonsList, function( comparisonModel ){
      var comparisonId = comparisonModel.id.toString();
      return {
        comparison: comparisonModel._rid,
        assessment: _.get( assessmentsMap, [ _.get( comparisonModel, 'assessment', '' ).toString(), 'name' ] ),
        assessor: _.get( comparisonModel, 'assessor.email', UNDEFINED ),
        "representation A": getDocument( documentsMap, _.get( comparisonModel, 'representations.a' ) ),
        "representation B": getDocument( documentsMap, _.get( comparisonModel, 'representations.b' ) ),
        "selected representation": getDocument( documentsMap, _.get( comparisonModel, 'data.selection' ) ),
        "completed": (comparisonModel.completed)
          ? TRUE
          : FALSE,
        "comparative feedback": _.get( comparisonModel, 'data.comparative', '' ).replace( /(?:\r\n|\r|\n)/g, "\u21A9" ).replace( /"/g, "'" ),
        "selection SEQ": _.get( comparisonModel, 'data.seq-selection', NIL ),
        "comparative SEQ": _.get( comparisonModel, 'data.seq-comparative', NIL ),
        "selection duration": _.get( timelogsMap, [ comparisonId, 'selection' ], UNDEFINED ),
        "selection SEQ duration": _.get( timelogsMap, [ comparisonId, 'seq-selection' ], UNDEFINED ),
        "comparative feedback duration": _.get( timelogsMap, [ comparisonId, 'comparative' ], UNDEFINED ),
        "comparative feedback SEQ duration": _.get( timelogsMap, [
          comparisonId, 'seq-comparative'
        ], UNDEFINED ),
        "total": _.reduce( timelogsMap[ comparisonId ], function( memo,
                                                                  value ){
          return memo + value;
        }, 0 )
      };
    } );
  };
}

module.exports.listComparisons = function listComparisons( assessmentIds ){
  return P.join(
    getPhasesMap(),
    getDocumentsMap(),
    getAssessmentsMap( assessmentIds ),
    getComparisonsList( assessmentIds ),

    function( phasesMap,
              documentsMap,
              assessmentsMap,
              comparisonsList ){
      return getTimelogsMap( _.pluck( comparisonsList, "_id" ) )
        .then( createComparisonsReportData( phasesMap, documentsMap, assessmentsMap, comparisonsList ) );
    }
  );
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
