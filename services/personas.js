'use strict';
var debug = require( 'debug' )( 'dpac:services.assessments' );
var _ = require('underscore');
var keystone = require( 'keystone' );
var schema = keystone.list( 'Persona' );

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
