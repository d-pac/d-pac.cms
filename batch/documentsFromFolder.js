'use strict';

var _ = require( 'underscore' );
var keystone = require( "keystone" );
var assert = require( 'assert' );
var mime = require( 'mime' );
var async = require( "async" );
var fs = require( 'fs' );
var path = require( 'path' );
var Document = keystone.list( "Document" );

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

exports = module.exports = function( folder,
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
      var documentData = {
        title: path.basename( fileName, path.extname( fileName ) ),
        file: {
          filename: fileName,
          originalname: fileName,
          path: 'app/uploads/media',
          size: stats.size,
          filetype: mime.lookup( fileName )
        },
        host: 'local'
      };
      saveQueue.push( new Document.model( documentData ) );
    }
  } );

  async.eachSeries( saveQueue, function( doc,
                                         next ){
    doc.save( next );
  }, done );

};

