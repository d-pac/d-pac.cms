"use strict";
const keystone = require( "keystone" );
const _ = require( "lodash" );
const P = require( 'bluebird' );
const moment = require( 'moment' );

const Comparison = keystone.list( "Comparison" );
const Representation = keystone.list( "Representation" );
const assessmentsService = require( './assessments' );
const timelogsService = require( './timelogs' );
const phasesService = require( './phases' );
const constants = require( '../models/helpers/constants' );

const phaseConfigsMap = _.reduce( constants.phases, function( memo,
                                                              phaseConfig ){
  memo[ phaseConfig.slug ] = phaseConfig;
  return memo;
}, {} );

const UNDEFINED = "N/A";
const TRUE = 1;
const FALSE = 0;

module.exports.listRepresentationsForAssessmentIds = function listRepresentationsForAssessmentIds( assessmentIds ){
  let q = Representation.model
    .find()
    .populate( 'document', 'name' )
    .populate( 'assessment', 'name' );
  if( assessmentIds ){
    if( _.isString( assessmentIds ) ){
      assessmentIds = [ assessmentIds ];
    }
    q = q.where( "assessment" ).in( assessmentIds );
  }
  return q.exec().then( function( result ){
    return result;
  } );
};

function getComparisonsList( assessmentIds ){
  let p = Comparison.model
    .find()
    .populate( "assessor" )
    .deepPopulate( [
      'representations.a.document', 'representations.b.document', 'data.selection.document',
      'data.select-other.document'
    ] );
  if( assessmentIds.length ){
    p = p.where( "assessment" ).in( assessmentIds );
  }
  return p.exec();
}

function createMap( memo,
                    item ){
  const id = item.id.toString();
  memo[ id ] = item;
  return memo;
}

function getPhasesMap(){
  return phasesService
    .list()
    .reduce( createMap, {} );
}

function getAssessmentsMap( assessmentIds ){
  const opts = { state: { $ne: constants.assessmentStates.ARCHIVED } };
  const p = (assessmentIds.length)
    ? assessmentsService.listById( assessmentIds, opts )
    : assessmentsService.list( opts );
  return p.reduce( createMap, {} );
}

function getTimelogsMap( comparisonIds/*,
                         phasesMap*/ ){
  return timelogsService
    .listForComparisonIds( comparisonIds )
    .reduce( function( memo,
                       timelog ){
      const comparisonId = timelog.comparison.toString();
      const phaseId = timelog.phase.toString();
      _.set( memo, [ comparisonId, phaseId ], timelog.duration );
      return memo;
    }, {} );
}

function createComparisonsReportData( phasesMap,
                                      assessmentsMap,
                                      comparisonsList ){
  return function( timelogsMap ){
    return _.map( comparisonsList, function( comparisonModel ){
      const comparisonId = comparisonModel.id.toString();
      const assessmentId = _.get( comparisonModel, 'assessment', '' ).toString();
      let assessment = assessmentsMap[ assessmentId ];
      if( !assessment ){
        assessment = {
          name: assessmentId,
          phases: _.keys( phasesMap ),
          enableTimeLogging: true
        };
      }
      let output = {
        comparison: comparisonModel._rid,
        assessment: assessment.name,
        assessor: _.get( comparisonModel, [ 'assessor', 'email' ], UNDEFINED ),
        "representation A": _.get( comparisonModel, [ 'representations', 'a', 'document', 'name' ] ),
        "representation B": _.get( comparisonModel, [ 'representations', 'b', 'document', 'name' ] ),
        // "selected representation": _.get( comparisonModel, [ 'data', 'selection', 'document', 'name' ] ),
        // "selected representation (other)": _.get( comparisonModel, [ 'data', 'select-other', 'document', 'name' ] ),
        "selected at": (comparisonModel.selectionMadeAt)
          ? moment( comparisonModel.selectionMadeAt ).format( "YYYY/MM/DD HH:mm:ss" )
          : UNDEFINED,
        "completed": (comparisonModel.completed)
          ? TRUE
          : FALSE
      };
      _.forEach( assessment.phases, function( phaseId ){
        const phase = phasesMap[ phaseId.toString() ];
        const phaseConfig = phaseConfigsMap[ phase.slug ];
        const values = phaseConfig.format.reports( comparisonModel );
        output = _.merge( output, values );
        // switch( phase.slug ){
        //   case constants.SEQ_COMPARATIVE:
        //   case constants.SEQ_PASSFAIL:
        //   case constants.SEQ_SELECTION:
        //     output[ phase.label ] = _.get( comparisonModel, [ 'data', phase.slug ], NIL );
        //     break;
        //   case constants.COMPARATIVE:
        //     output[ phase.label ] = _.get( comparisonModel, [
        //       'data', phase.slug
        //     ], '' ).replace( /(?:\r\n|\r|\n)/g, "\u21A9" ).replace( /"/g, "'" );
        //     break;
        //   case constants.PROSCONS:
        //     output[ "A+" ] = _.get( comparisonModel, [
        //       'data', phase.slug, 'aPositive'
        //     ], '' ).replace( /(?:\r\n|\r|\n)/g, "\u21A9" ).replace( /"/g, "'" );
        //     output[ "A-" ] = _.get( comparisonModel, [
        //       'data', phase.slug, 'aNegative'
        //     ], '' ).replace( /(?:\r\n|\r|\n)/g, "\u21A9" ).replace( /"/g, "'" );
        //     output[ "B+" ] = _.get( comparisonModel, [
        //       'data', phase.slug, 'bPositive'
        //     ], '' ).replace( /(?:\r\n|\r|\n)/g, "\u21A9" ).replace( /"/g, "'" );
        //     output[ "B-" ] = _.get( comparisonModel, [
        //       'data', phase.slug, 'bNegative'
        //     ], '' ).replace( /(?:\r\n|\r|\n)/g, "\u21A9" ).replace( /"/g, "'" );
        //     break;
        //   case constants.PASSFAIL:
        //     output[ "A passed" ] = _.get( comparisonModel, [ 'data', phase.slug, 'a' ], UNDEFINED );
        //     output[ "B passed" ] = _.get( comparisonModel, [ 'data', phase.slug, 'b' ], UNDEFINED );
        //     break;
        // }
        if( assessment.enableTimeLogging ){
          output[ phase.label + " duration" ] = _.get( timelogsMap, [ comparisonId, phaseId.toString() ], UNDEFINED );
        }
      } );
      if( assessment.enableTimeLogging ){
        output[ "total duration" ] = _.reduce( timelogsMap[ comparisonId ], function( memo,
                                                                                      value ){
          return memo + value;
        }, 0 );
      }
      return output;
    } );
  };
}

module.exports.listComparisons = function listComparisons( assessmentIds ){
  return P.join(
    getPhasesMap(),
    getAssessmentsMap( assessmentIds ),
    getComparisonsList( assessmentIds ),

    function( phasesMap,
              assessmentsMap,
              comparisonsList ){
      return getTimelogsMap( _.map( comparisonsList, "_id" ), phasesMap )
        .then( createComparisonsReportData( phasesMap, assessmentsMap, comparisonsList ) );
    }
  );
};

module.exports.listRepresentations = function listRepresentations( assessmentIds ){
  return module.exports.listRepresentationsForAssessmentIds( assessmentIds )
    .map( function( representationModel ){
      return {
        assessment: _.get( representationModel, [ 'assessment', 'name' ], '' ),
        name: _.get( representationModel, [ 'document', 'name' ], '' ),
        ability: _.get( representationModel, [ 'ability', 'value' ], UNDEFINED ),
        se: _.get( representationModel, [ 'ability', 'se' ], UNDEFINED ),
        rankType: representationModel.rankType || UNDEFINED
      };
    } );
};
