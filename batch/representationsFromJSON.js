'use strict';

var _ = require( 'underscore' );
var keystone = require( "keystone" );
var assert = require( 'assert' );
var async = require( "async" );
var fs = require( 'fs' );
var path = require( 'path' );
var Assessment = keystone.list( "Assessment" );
var Document = keystone.list( "Document" );
var Representation = keystone.list( "Representation" );

var created = [];

function getStats( resolved ){
  var stats;
  try{
    stats = fs.statSync( resolved );
  } catch( err ) {
  }
  return stats;
}

exports = module.exports = function( assessmentId,
                                     file,
                                     done ){

  var data = require( file );
  var closeTo = _.filter( data, function( repData ){
    return !!repData.closeTo;
  } );

  var mapByFilename = {};
  var saveQueue = [];

  Assessment.model.findById( assessmentId ).exec().then( function( assessment ){
    if( !assessment ){
      throw new Error( 'Assessment not found:' + assessmentId );
    }
    async.eachSeries( data, function( repData,
                                      next ){

      /*
       repData:
       {
       "fileName": "0506_kinderen_3.pdf",
       "ability": {
       "value": "-4.86083100953108",
       "se": "1.19344007065948"
       },
       "rankType": "ranked",
       "closeTo": null
       }
       */

      Document.model.findOne( { "file.originalname": repData.fileName } ).exec().then( function( document ){
        if( !document ){
          throw new Error( 'Document not found:', repData.fileName );
        }
        var representationData = {
          name: assessment.title + " - " + document.title,
          assessment: assessment._id,
          document: document._id,
          compared: [],
          ability: repData.ability,
          rankType: repData.rankType
          //closeTo: not yet, needs to be found by filename
        };
        var representation = new Representation.model( representationData );
        mapByFilename[ document.file.filename ] = representation;
        saveQueue.push( representation );
        next();
      } ).then( null, function( err ){
        throw err;
      } );

    }, function( err ){
      if( err ){
        console.error( err );
        return done( err );
      }

      _.each( closeTo, function( repData ){
        var representation = mapByFilename[ repData.fileName ];
        if( !representation ){
          throw new Error( 'Something went wrong mapping:', repData.fileName );
        }
        var id =  mapByFilename[ repData.closeTo ].id
        representation.closeTo = id;
      } );

      async.eachSeries( saveQueue, function( doc,
                                             next ){

        doc.save( next );
      }, done );
    } );

  } );
};
