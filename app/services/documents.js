"use strict";
const debug = require( "debug" )( "dpac:services.documents" );
const P = require( 'bluebird' );
const mv = P.promisify(require('mv'));

const path = require( 'path' );

const keystone = require( "keystone" );
const constants = require( "../models/helpers/constants" );
const collection = keystone.list( "Document" );
const Service = require( "./helpers/Service" );
const base = new Service( collection, debug );
module.exports = base.mixin();

module.exports.create = function( opts ){
  debug( '#create' );
  let p;
  if( opts.file ){
    p = P.try( function(){
      const source = opts.file.source;
      const filename = path.basename( source );
      opts.file.path = constants.directories.documents;
      return mv( source, path.resolve( opts.file.path, filename ) );
    } )
      .catch( ( err )=>P.reject( err ) );

  } else {
    p = P.resolve();
  }
  return p.then( ()=>base.create( opts ) );
};

module.exports.update = function( opts ){
  debug( '#update' );
  let p;
  if( opts.file ){
    p = P.try( function(){
      const source = opts.file.source;
      const filename = path.basename( source );
      opts.file.path = constants.directories.documents;
      return mv( source, path.resolve( opts.file.path, filename ) );
    } )
      .catch( ( err )=>P.reject( err ) );

  } else {
    p = P.resolve();
  }
  return p.then( ()=>base.update( opts ).exec() );
};
