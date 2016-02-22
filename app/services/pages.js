"use strict";
var debug = require( "debug" )( "dpac:services.pages" );
var _ = require( "lodash" );
var keystone = require( "keystone" );
var collection = keystone.list( "Page" );
var Service = require( "./helpers/Service" );
var base = new Service( collection );
module.exports = base.mixin();

module.exports.list = function list( opts ){
  debug( "#list" );
  opts = _.defaults( {}, opts, {
    state: "published"
  } );
  return base.list( opts )
    .exec();
};

module.exports.retrieve = function retrieve( opts ){
  debug("#retrieve");
  return base.list( opts )
    .exec().then( function( results ){
      if( results && results.length ){
        return results[ 0 ];
      }
      return false;
    } );
};
