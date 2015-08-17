'use strict';

var _ = require( 'lodash' );
var keystone = require( "keystone" );
var assert = require( 'assert' );
var mime = require( 'mime' );
var async = require( "async" );
var fs = require( 'fs' );
var path = require( 'path' );
var Document = keystone.list( "Document" );
var Representation = keystone.list( "Representation" );

var ignored = [ '.DS_Store' ];

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
                                     folder,
                                     done ){

  var resolvedFolder = path.resolve( folder );
  var files;
  try{
    files = fs.readdirSync( resolvedFolder );
  } catch( err ) {
    return done( err );
  }

  var saveQueue = [];
  files = _.without.apply( _, [ files ].concat( ignored ) );

  _.each( files, function( fileName ){
    var resolvedFile = path.resolve( folder, fileName );
    var stats = getStats( resolvedFile );
    if( stats.isFile() ){
      var documentModel = new Document.model( {
        title: path.basename( fileName, path.extname( fileName ) ),
        file: {
          filename: fileName,
          originalname: fileName,
          path: 'app/uploads/media',
          size: stats.size,
          filetype: mime.lookup( fileName )
        },
        host: 'local'
      } );
      saveQueue.push( documentModel );
      var representationModel = new Representation.model( {
        assessment: assessmentId,
        document: documentModel.id.toString()
      } );
      saveQueue.push(representationModel);
    }
  } );

  async.eachSeries( saveQueue, function( doc,
                                         next ){
    doc.save( next );
  }, done );

};

