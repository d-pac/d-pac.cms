"use strict";
var debug = require( "debug" )( "dpac:services.representations" );
var keystone = require( "keystone" );
var _ = require( "lodash" );
var schema = keystone.list( "Representation" );
var Service = require( "./helpers/Service" );
var requireProp = require( './helpers/requireProp' );
var base = new Service( schema );
module.exports = base.mixin();

module.exports.list = function list( opts ){
  debug( "list" );
  return base.list( opts )
    .populate( "document" )
    .execAsync();
};

module.exports.listById = function listById( opts ){
  debug( "listById" );
  return base.listById( opts )
    .populate( "document" )
    .execAsync();
};

module.exports.retrieve = function list( opts ){
  debug( "list" );
  return base.retrieve( opts )
    .populate( "document" )
    .execAsync();
};

module.exports.select = function select( opts ){
  debug( "#select", opts );
  requireProp( opts, "assessment" );

  opts = _.defaults( opts, {
    algorithm: "comparative-selection"
  } );

  return this.list( _.omit( opts, 'algorithm' ) )
    .then( function( representations ){
      var data = require( opts.algorithm ).select( representations );
      if( data.result && data.result.length ){
        return data.result;
      } else {
        throw new Error( 'TODO: implement this' );
      }
    } );
};
