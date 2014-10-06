'use strict';
var debug = require( 'debug' )( 'dpac:services.seqs' );
var keystone = require( 'keystone' );
var schema = keystone.list('Seq');

module.exports.create = function( opts ){
  debug( '#create' );
  return schema.model.create( opts );
};
