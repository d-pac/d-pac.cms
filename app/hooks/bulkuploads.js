'use strict';

var keystone = require( 'keystone' );
var _ = require( 'lodash' );
var P = require( 'bluebird' );
var unzip = P.promisify( require( 'extract-zip' ) );
var rimraf = P.promisify( require( 'rimraf' ) );
var fs = P.promisifyAll( require( 'fs' ) );
var path = require( 'path' );
var mime = require( 'mime' );
var uuid = require( 'uuid' );

var assessmentsService = require( '../services/assessments' );
var documentsService = require( '../services/documents' );
var Document = keystone.list( 'Document' );
var Representation = keystone.list( 'Representation' );
var constants = require( '../models/helpers/constants' );

var ignored = [ '.DS_Store' ];

function extractZipfile( bulkupload,
                         opts ){
  return unzip( opts.file, {
    dir: opts.temp
  } );
}

function updateDocument( document,
                         fileData,
                         opts ){
  document.title = path.basename( fileData.filename, path.extname( fileData.filename ) );
  document.file = {
    filename: fileData.filename,
    originalname: fileData.originalname || fileData.filename,
    path: opts.dest,
    size: fileData.stats.size,
    filetype: mime.lookup( fileData.filename )
  };
  document.host = 'local';
  return document;
}

function readDirectoryContents( opts ){
  return fs.readdirAsync( opts.temp )
    .then( function( files ){
      return _.without.apply( _, [ files ].concat( ignored ) );
    } );
}

function createFileData( filename,
                         dir ){
  var fileData = {};
  fileData.filename = filename;
  fileData.resolved = path.join( dir, filename );
  try{
    fileData.stats = fs.statSync( fileData.resolved );
  } catch( err ) {
    //file doesn't exist
    fileData.stats = {
      isFile: function(){
        return false;
      }
    };
  }
  return fileData;
}

function moveFile( src,
                   dest ){
  return fs.renameAsync( src.resolved, dest.resolved );
}

function createRepresentation( document,
                               assessment ){
  return new Representation.model( {
    document: document.id.toString(),
    assessment: assessment.id.toString()
  } );
}

function findDocuments( fileData ){
  return documentsService.list( {
    'file.filename': fileData.filename
  } );
}

function removeFile( fileData ){
  return fs.unlinkAsync( fileData.resolved );
}

function reuseStrategy( files,
                        assessment,
                        opts ){
  return findDocuments( files.dest )
    .then( function( documents ){
      var document = (documents && documents.length)
        ? documents[ 0 ]
        : new Document.model();
      document = updateDocument( document, files.src, opts );
      return [ document, createRepresentation( document, assessment ) ];
    } );
}

function overwriteStrategy( files,
                            assessment,
                            opts ){
  files.dest.stats = files.src.stats;
  return P.join(
    findDocuments( files.dest ),
    removeFile( files.dest )
      .then( function(){
        return moveFile( files.src, files.dest );
      } ),
    function( documents ){
      var document = (documents && documents.length)
        ? documents[ 0 ]
        : new Document.model();
      document = updateDocument( document, files.dest, opts );
      return [ document, createRepresentation( document, assessment ) ];
    }
  );
}

function createStrategy( files,
                         assessment,
                         opts ){
  return moveFile( files.src, files.dest )
    .then( function(){
      var document = updateDocument( new Document.model(), files.src, opts );
      return [ document, createRepresentation( document, assessment ) ];
    } );
}

function renameStrategy( files,
                         assessment,
                         opts ){
  files.dest = createFileData(uuid.v4() + path.extname( files.src.filename ), constants.directories.documents);
  files.dest.originalname = files.src.filename;
  files.dest.stats = files.src.stats;
  return moveFile( files.src, files.dest )
    .then( function(){
      var document = updateDocument( new Document.model(), files.dest, opts );
      return [ document, createRepresentation( document, assessment ) ];
    } );
}

var strategies = {
  create: createStrategy
};
strategies[ constants.RENAME ] = renameStrategy;
strategies[ constants.REUSE ] = reuseStrategy;
strategies[ constants.OVERWRITE ] = overwriteStrategy;

/*
 conflict resolution:
 overwrite: reuse document and overwrite the file
 reuse: reuse the document discard new file
 rename: create a new document and rename the file
 */

function processFiles( bulkupload,
                       assessment,
                       opts ){
  return readDirectoryContents( opts )
    .reduce( function( memo,
                       filename ){
      var files = {
        src: createFileData( filename, opts.temp )
      };
      if( !files.src.stats.isFile() ){
        return memo;
      }
      files.dest = createFileData( filename, opts.dest );
      var strategy = ( files.dest.stats.isFile() )
        ? strategies[ bulkupload.conflicts ]
        : strategies.create;

      return new P( function( resolve,
                              reject ){
        strategy( files, assessment, opts ).then( function( result ){
          resolve( memo.concat( result ) );
        } );
      } );
    }, [] ).each( function( doc ){
      return P.promisify( doc.save, doc )();
    } );
}

function cleanup( bulkupload,
                  opts ){
  return removeFile( { resolved: opts.file } )
    .then( function(){
      return rimraf( opts.temp );
    } ).then( function(){
      bulkupload.completed = true;
    } );
}

function bulkuploadSavedHandler( next ){
  var bulkupload = this;
  if( bulkupload.completed ){
    return next( new Error( 'You cannot reuse bulk uploads. (Seriously that would mean a world of pain)' ) );
  }

  if( bulkupload.isNew ){
    return next();
  }

  if( !bulkupload.zipfile || !bulkupload.zipfile.filename ){
    return next( new Error( 'Zipfile is required!' ) );
  }

  var opts = {
    file: path.join( constants.directories.bulk, bulkupload.zipfile.filename ),
    temp: path.join( constants.directories.bulk, bulkupload._rid.toString() ),
    dest: constants.directories.documents
  };

  extractZipfile( bulkupload, opts )
    .then( function(){
      return assessmentsService.retrieve( {
        _id: bulkupload.assessment.toString()
      } );
    } )
    .then( function( assessment ){
      return processFiles( bulkupload, assessment, opts );
    } )
    .then( function(){
      return cleanup( bulkupload, opts );
    } )
    .then( function(){
      next();
    } )
    .catch( next );
}

module.exports.init = function(){
  keystone.list( 'Bulkupload' ).schema.pre( 'save', bulkuploadSavedHandler );
};
