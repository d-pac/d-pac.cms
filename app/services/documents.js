"use strict";
const debug = require( "debug" )( "dpac:services.documents" );
const P = require( 'bluebird' );
const fs = require( 'fs' );
P.promisify( fs.rename );
const path = require( 'path' );

const keystone = require( "keystone" );
const constants = require( "../models/helpers/constants" );
const collection = keystone.list( "Document" );
const Service = require( "./helpers/Service" );
const base = new Service( collection );
module.exports = base.mixin();

module.exports.create = function( opts ){
  debug( '#create' );
  let p;
  if( opts.file ){
    const source = opts.file.path;
    opts.file.path = path.join( constants.directories.documents, opts.file.filename );
    p = fs.renameAsync( source, opts.file.path )
      .catch( ( err )=>P.reject( err ) );

  } else {
    p = P.resolve();
  }
  return p.then( ()=>base.create( opts ) );
};

module.exports.update = function( opts ){
  debug( '#update' );
  const source = opts.file.path;
  opts.file.path = path.join( constants.directories.documents, opts.file.filename );
  opts.title = '';
  return fs.renameAsync( source, opts.file.path )
    .catch( ( err )=>P.reject( err ) )
    .then( ()=>{
      return base.update( opts ).exec();
    } );
};
