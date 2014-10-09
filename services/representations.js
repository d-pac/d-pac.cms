'use strict';
var keystone = require( 'keystone' );
var _ = require( 'underscore' );
var Representation = keystone.list( 'Representation' );

function toSafeJSON( representations ){
  if( _.isArray( representations ) ){
    return _.map( representations, function( doc ){
      return doc.toSafeJSON();
    } );
  }else{
    return representations.toSafeJSON();
  }
}

module.exports.list = function list( opts ){
  return Representation.model
    .where( '_id' ).in( opts.ids )
    .exec()
    .then( function( representations ){
      return toSafeJSON( representations );
    } );
};

module.exports.retrievePair = function retrieveRepresentationPair( opts ){

  //debug('retrieveRepresentations');
  //todo: replace this with CJ
  return Representation.model
    .find()
    .sort( { createdAt : -1 } )
    .limit( 2 )
    .exec()
    .then( function( representations ){
      if( !representations || representations.length <= 1 ){
        throw new Error( 'No representations' );
      }

      return toSafeJSON( representations );
    } );
};

module.exports.retrieveFull = function retrieveFull( opts ){
  return Representation.model
    .findById( opts._id )
    .exec();
};
