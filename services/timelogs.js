'use strict';

var debug = require( 'debug' )( 'dpac:services.timelogs' );
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var schema = keystone.list('Timelog');

var listById = module.exports.listById = function listById(ids){
  return schema.model
    .find()
    .where( '_id' ).in( ids )
    .lean()
    .exec();
};

module.exports.list = function list( opts ){
  debug('list');
  if( _.isArray(opts)){
    return listById(opts);
  }

  return schema.model
    .find(opts)
    .lean()
    .exec();
};

module.exports.create = function( opts ){
  debug( '#create' );
  return schema.model.create( opts );
};
