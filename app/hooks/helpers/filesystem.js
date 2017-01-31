'use strict';

const P = require( 'bluebird' );
const fs = P.promisifyAll( require( 'fs' ) );
const unzip = P.promisify( require( 'extract-zip' ) );
const dirops = P.promisifyAll( require( 'node-dir' ) );
const path = require( 'path' );
const rimraf = P.promisify( require( 'rimraf' ) );

const ignored = [ '.DS_Store' ];

function extractZipfile( opts ){
  return unzip( opts.file, {
    dir: opts.temp
  } )
    .catch( function( err ){
      console.error( 'ERROR:', err );
    } );
}

function retrieveJSONData( opts ){
  if( !opts.json ){
    return P.resolve( false );
  }
  return fs.readFileAsync( opts.json, 'utf8' )
    .then( function( jsonStr ){
      return JSON.parse( jsonStr );
    } )
    .reduce( function( memo,
                       item ){
      memo[ item.fileName ] = item;
      return memo;
    }, {} )
    ;
}

function readDirectoryContents( opts ){
  return dirops.filesAsync( opts.temp )
    .then( function( files ){
      return files.filter( function( file ){
        const filename = path.basename( file );
        const index = ignored.indexOf( filename );
        return index < 0;
      } );
    } );
}

function createFileData( filepath,
                         dir ){
  const fileData = {};
  fileData.filename = path.basename( filepath );
  fileData.resolved = (dir)
    ? path.join( dir, fileData.filename )
    : filepath;
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

function removeFile( fileData ){
  return fs.unlinkAsync( fileData.resolved )
    .then( ()=>'success')
    .catch( ( err )=>err.toString());
}

function removeDir( dirData ){
  return rimraf( dirData.resolved )
    .then( ()=>'success')
    .catch( ( err )=>err.toString());
}

function cleanup( files,
                  dirs ){

  if(!dirs){
    dirs = [];
  }
  return P.props( {
    files: P.mapSeries( files, function( file ){
      return (file)
        ? removeFile( { resolved: file } ).then((result)=>`${file}:${result}`)
        : null;
    } ),
    dirs: P.mapSeries( dirs, function( dir ){
      return (dir)
        ? removeDir( { resolved: dir } ).then((result)=>`${dir}:${result}`)
        : null;
    } ),
  } )
    .then( function( results ){
      return [...results.files, ...results.dirs];
    } );
  /*
   return P.try( function(){
   if( opts.file ){
   return removeFile( { resolved: opts.file } );
   }
   return null;
   } )
   .then( function(){
   if( opts.json ){
   return removeFile( { resolved: opts.json } );
   }
   return null;
   } )
   .then( function(){
   if( opts.temp ){
   return rimraf( opts.temp );
   }
   return null;
   } )
   .then( function(){
   bulkupload.completed = true;
   } )
   ;
   */
}

module.exports = {
  extractZipfile: extractZipfile,
  retrieveJSONData: retrieveJSONData,
  readDirectoryContents: readDirectoryContents,
  createFileData: createFileData,
  moveFile: moveFile,
  removeFile: removeFile,
  cleanup: cleanup,
};
