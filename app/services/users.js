"use strict";

var keystone = require( "keystone" );
var _ = require( "lodash" );
var debug = require( "debug" )( "dpac:services.users" );
var schema = keystone.list( "User" );
var Service = require( "./helpers/Service" );
var assessmentsService = require( "./assessments" );
var comparisonsService = require( "./comparisons" );
var notesService = require( './notes' );

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

module.exports.listAssessments = function listAssessments( role,
                                                           opts ){
  debug( "#listAssessments" );
  return this.retrieve( _.defaults( {}, opts, {
      fields: (role)
        ? "assessments." + role
        : "assessments"
    } ) )
    .then( function( user ){
      var ids = _.reduce( user.assessments.toJSON(), function( memo,
                                                               assessmentIds ){
        //no need to filter: duplicate id's get automatically consolidated by mongoose
        return memo.concat( assessmentIds );
      }, [] );
      return assessmentsService.listById( ids, { state: { $in: [ 'calculated', 'published' ] } } );
    } ).map( function( assessment ){
      assessment = assessment.toJSON( { depopulate: true } );// necessary, otherwise the added `completedNum` won't stick
      return comparisonsService.completedCount( {
        assessment: assessment._id,
        assessor: opts._id
      } ).then( function( count ){
        var total = _.reduce( assessment.comparisonsNum.perAssessor, function( total,
                                                                               num ){
          return total + num;
        }, 0 );
        assessment.progress = {
          completedNum: count,
          total: total
        };
        return assessment;
      } );
    } );
};

module.exports.listIncompleteComparisons = function listIncompleteComparisons( opts ){
  return this.listAssessments( 'assessor', opts )
    .then( function( assessments ){
      return comparisonsService.listForAssessments( {
        assessor: opts._id,
        completed: false
      }, _.map( assessments, '_id' ) );
    } );
};

module.exports.listNotes = function listNotes( opts ){
  return notesService.list( {
    author: opts._id
  } );
};

module.exports.update = function update( opts ){
  debug( "#update" );
  return base.update( this.retrieve( opts ), opts )
    .execAsync();
};

module.exports.listForAssessments = function listForAssessments( role,
                                                                 assessmentIds ){
  return base.list()
    .execAsync()
    .filter( function( user ){
      return !!_.find( assessmentIds, function( assessmentId ){
        var found = false;
        if( role === 'assessor' || role === 'both' ){
          found = found || user.assessments.assessor.indexOf( assessmentId ) > -1;
        }
        if( role === 'assessee' || role === 'both' ){
          found = found || user.assessments.assessee.indexOf( assessmentId ) > -1;
        }
        return found;
      } );
    } );
};

module.exports.countInAssessment = function countInAssessment( role,
                                                               assessmentId ){
  return this.listForAssessments( role, [ assessmentId ] )
    .then( function( users ){
      return users.length;
    } );
};
