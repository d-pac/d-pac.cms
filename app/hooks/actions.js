'use strict';

const _ = require( 'lodash' );
const P = require( 'bluebird' );
const keystone = require( 'keystone' );

const representationsService = require( '../services/representations' );
const assessmentsService = require( '../services/assessments' );
const service = require( '../services/actions' );
const handleHook = require( './helpers/handleHook' );

function cloneRepresentations( source,
                               target ){
  const map = {};
  const related = [];
  return representationsService.list( {
    assessment: source.id
  } )
    .mapSeries( ( representation )=>{
      const source = representation.toJSON();
      const clone = _.omit( source, [
        '_id', 'name', 'title', 'assessment', 'compared', 'ability', 'closeTo'
      ] );
      clone.assessment = target.id;
      if( clone.rankType === 'benchmark' ){
        clone.ability = source.ability;
      }
      return representationsService.create( clone )
        .then( ( subject )=>{
          map[ representation.id ] = subject.id;
          if( representation.closeTo ){
            related.push( {
              subject: subject,
              target: representation.closeTo.toString()
            } );
          }
          return subject;
        } );
    } )
    .then( ( representations )=>{
      related.forEach( ( config )=>{
        config.subject.closeTo = map[ config.target ];
      } );
      return related;
    } )
    .mapSeries( ( modified )=>{
      return modified.subject.save();
    } )
    .then( ()=>{
      return Object.keys( map );
    } );
}

function executeAction( action ){

  function failureHandler( err ){
    action.line = "FAILED";
    action.success = false;
    action.log = err;
    return P.resolve();
  }

  const p = assessmentsService.retrieve( { _id: action.assessment } );

  switch( action.actionType ){
    case "clone":
      return p.then( function( assessment ){
        const clone = _.omit( assessment.toJSON(), [
          '_id', 'state', 'schedule', 'stage', 'cache', 'stats', 'parent'
        ] );
        clone.name += ' (Copy)';
        return P.props( {
          source: assessment,
          clone: assessmentsService.create( clone )
        } );
      } )
        .then( function( assessments ){
          return P.props( {
            assessment: assessments.source,
            representations: cloneRepresentations( assessments.source, assessments.clone )
          } );
        } )
        .then( function( data ){
          action.line = "Assessment: " + data.assessment.name;
          action.log = `Successfully cloned the assessment and ${data.representations.length} representations`;
          action.success = true;
        } )
        .catch( failureHandler );
    case "clone representations":
      if( !action.targetAssessment ){
        return P.reject( new Error( 'Receiving assessment is required!' ) );
      }
      if( action.assessment.equals( action.targetAssessment ) ){
        return P.reject( new Error( 'Can not clone representations to the same assessment!' ) );
      }
      return p.then( function( assessment ){
        return P.props( {
          source: assessment,
          target: assessmentsService.retrieve( { _id: action.targetAssessment } )
        } );
      } )
        .then( function( assessments ){
          return P.props( {
            assessment: assessments.source,
            representations: cloneRepresentations( assessments.source, assessments.target )
          } );
        } )
        .then( function( data ){
          action.line = "Assessment: " + data.assessment.name;
          action.log = `Successfully cloned ${data.representations.length} representations`;
          action.success = true;
        } )
        .catch( failureHandler );
    case "reset":
      return p.then( function( assessment ){
        return service.resetAssessment( assessment )
      } )
        .then( function( assessment ){
          action.line = "Assessment: " + assessment.name;
          action.log = "Successfully reset";
          action.success = true;
        } )
        .catch( failureHandler );

    case "clear":
      return p.then( function( assessment ){
        return service.clearAssessment( assessment )
      } )
        .then( function( assessment ){
          action.line = "Assessment: " + assessment.name;
          action.log = "Successfully cleared";
          action.success = true;
        } )
        .catch( failureHandler );

    case "delete":
      return p.then( function( assessment ){
        return service.deleteAssessment( assessment )
      } )
        .then( function( assessment ){
          action.line = "Assessment: " + assessment.name;
          action.log = "Successfully deleted";
          action.success = true;
        } )
        .catch( failureHandler );

    case "archive" :
      return p.then( function( assessment ){
        return service.archiveAssessment( assessment )
      } )
        .then( function( result ){
          action.line = "Assessment: " + result.assessment.name;
          action.log = result.out;
          action.success = true;
        } )
        .catch( failureHandler );

    default:
      return P.reject( new Error( "Unhandled action: " + action.actionType ) );
  }
}

module.exports.init = function(){
  keystone.list( 'Action' ).schema.pre( 'save', handleHook( executeAction ) );
  keystone.list( 'Assessment' ).schema.pre( 'remove', handleHook( ( assessment )=>{
    return service.prepAssessmentForDeletion( assessment );
  } ) );
};

