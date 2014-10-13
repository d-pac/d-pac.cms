'use strict';
var keystone = require( 'keystone' );
var _ = require( 'underscore' );
var schema = keystone.list( 'Representation' );

function toSafeJSON( representations ){
  if( _.isArray( representations ) ){
    return _.map( representations, function( doc ){
      return doc.toSafeJSON();
    } );
  }else{
    return representations.toSafeJSON();
  }
}

var listById = module.exports.listById = function(ids){
  return schema.model
    .find()
    .where( '_id' ).in( ids )
    .exec()
    .then( function( representations ){
      return toSafeJSON( representations );
    } );
};

module.exports.list = function list( opts ){
  if( _.isArray(opts)){
    return listById(opts);
  }
  return schema.model
    .find(opts)
    .exec()
    .then( function( representations ){
      return toSafeJSON( representations );
    } );
};

module.exports.retrievePair = function retrieveRepresentationPair( opts ){

  //debug('retrieveRepresentations');
  //todo: replace this with CJ
  return schema.model
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
  return schema.model
    .findById( opts._id )
    .exec();
};
