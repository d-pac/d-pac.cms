'use strict';

var _ = require( 'underscore' );
var keystone = require( "keystone" );
var assert = require( 'assert' );
var mime = require( 'mime' );
var async = require( "async" );
var fs = require( 'fs' );
var path = require( 'path' );
var Assessment = keystone.list( "Assessment" );
var Comparison = keystone.list( "Comparison" );
var Representation = keystone.list( "Representation" );

module.exports = function( assessmentId,
                           done ){

  Assessment.model.findById( assessmentId ).exec( function( err,
                                                            srcAssessment ){
    if( !srcAssessment ){
      return done( 'Assessment not found:' + assessmentId );
    }
    var saveQueue = [];

    srcAssessment.stage = 0;

    saveQueue.push( srcAssessment );

    Representation.model
      .find( { assessment: assessmentId } )
      .exec()
      .then( function( representations ){
        _.each( representations, function( srcRepresentation ){
          srcRepresentation.compared = [];
          saveQueue.push( srcRepresentation );
        } );
      } ).then( function(){
        Comparison.model.remove( {
          assessment: assessmentId
        }, function( err ){
          if( err ){
            throw err;
          }
        } );
      } ).then( function(){
        async.eachSeries( saveQueue, function( doc,
                                               next ){
          console.log( "Saving:", doc.id );
          doc.save( next );
        }, done );
      } ).then( null, function( err ){
        done( err );
      } );
  } );
};
//async.eachSeries( saveQueue, function( doc,
//                                       next ){
//  console.log( "Saving:", doc.id );
//  doc.save( next );
//}, done );
