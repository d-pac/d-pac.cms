'use strict';
var debug = require( 'debug' )( 'dpac:services.representations' );
var keystone = require( 'keystone' );
var _ = require( 'underscore' );
var schema = keystone.list( 'Representation' );
var toSafeJSON = require('./utils').toSafeJSON;

var listById = module.exports.listById = function(ids){
  return schema.model
    .find()
    .where( '_id' ).in( ids )
    .exec()
    .then( function( representations ){
      return toSafeJSON( representations );
    } );
};

var list = module.exports.list = function list( opts ){
  debug("#list");
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

  debug('retrievePair');
  //todo: replace this with CJ
  return list()
    .then( function( representations ){
      var shuffled = _.shuffle(representations);
      return shuffled.slice(0, 2);
    } );
};

module.exports.retrieveFull = function retrieveFull( opts ){
  return schema.model
    .findById( opts._id )
    .exec();
};
