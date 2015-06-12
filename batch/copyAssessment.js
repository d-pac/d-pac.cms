'use strict';

var _ = require( 'underscore' );
var keystone = require( "keystone" );
var ObjectId = require( 'mongoose' ).Types.ObjectId;
var assert = require( 'assert' );
var mime = require( 'mime' );
var async = require( "async" );
var fs = require( 'fs' );
var path = require( 'path' );
var Assessment = keystone.list( "Assessment" );
var Document = keystone.list( "Document" );
var Representation = keystone.list( "Representation" );

module.exports = function( assessmentId,
                           name,
                           done ){

  if( arguments.length < 3 ){
    return done( new Error( '3 required parameters: assessmentId, name, done' ) );
  }
  Assessment.model.findById( assessmentId ).exec( function( err,
                                                            srcAssessment ){
    if( !srcAssessment ){
      return done( 'Assessment not found:' + assessmentId );
    }
    var saveQueue = [];
    var newAssessment = new Assessment.model( {
      name: name,
      title: name,
      algorithm: srcAssessment.algorithm,
      assignments: {
        assessee: srcAssessment.assignments.assessee,
        assessor: srcAssessment.assignments.assessor
      },
      phases: srcAssessment.phases,
      comparisonsNum: {
        total: srcAssessment.comparisonsNum.total,
        stage: srcAssessment.comparisonsNum.stage
      },
      state: 'draft',
      //parent
      //stage
      enableTimeLogging: srcAssessment.enableTimeLogging,
      uiCopy: srcAssessment.uiCopy
    } );

    saveQueue.push( newAssessment );

    Representation.model.find( { assessment: assessmentId } ).exec( function( err,
                                                                              srcRepresentations ){
      var benchmarks = {};
      var newRepresentations = [];
      _.each( srcRepresentations, function( srcRepresentation ){
        var newRepresentation = new Representation.model( {
          assessment: newAssessment.id,
          document: srcRepresentation.document,
          compared: [],
          ability: {
            value: srcRepresentation.ability.value,
            se: srcRepresentation.ability.se
          },
          rankType: srcRepresentation.rankType,
          closeTo: srcRepresentation.closeTo
        } );
        if( srcRepresentation.rankType === 'benchmark' ){
          benchmarks[ srcRepresentation.id.toString() ] = newRepresentation.id.toString();
        }
        newRepresentations.push( newRepresentation );
      } );

      _.each( newRepresentations, function( rep ){
        if( rep.closeTo ){
          var oldId = rep.closeTo.toString();
          var newId = benchmarks[ oldId ];
          rep.closeTo = ObjectId( newId );
        }
      } );
      saveQueue = saveQueue.concat( newRepresentations );
      async.eachSeries( saveQueue, function( doc,
                                             next ){
        console.log( "Saving:", doc.id );
        doc.save( next );
      }, done );
    } );
  } );
};
