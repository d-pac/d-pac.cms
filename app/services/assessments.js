"use strict";
var debug = require( "debug" )( "dpac:services.assessments" );
var _ = require( "underscore" );

var keystone = require( "keystone" );
var schema = keystone.list( "Assessment" );
var Service = require( "./helpers/Service" );
var base = new Service( schema );
module.exports = base.mixin();

module.exports.list = function list( opts ){
  debug( "list" );
  opts = _.defaults( {}, opts, {
    state : "published"
  } );
  return base.list( opts )
    .execAsync();
};

module.exports.listById = function listById( ids,
                                             opts ){
  debug( "listById" );
  opts = _.defaults( {}, opts, {
    state : "published"
  } );
  return base.listById( ids, opts )
    .execAsync();
};
