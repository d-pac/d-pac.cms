"use strict";
var P = require( "bluebird" );
var extend = require( "deep-extend" );

module.exports = function updateResource(collection, opts){
  return P.resolve(
    collection.model
      .findById( opts._id )
      .exec()
  ).then( function( doc ){
      if( !doc ){
        return P.resolve( [] );
      }
      extend( doc, opts );
      var save = P.promisify( doc.save, doc );
      return save();
    } ).spread( function( mixed ){
      return mixed;
    } );
};
