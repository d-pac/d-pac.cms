'use strict';

var debug = require( 'debug' )( 'dpac:services.timelogs' );
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var schema = keystone.list('Timerange');

module.exports.create = function( opts ){
  debug( '#create' );
  return schema.model.create( opts );
};
