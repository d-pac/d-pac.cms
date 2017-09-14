"use strict";
const debug = require( "debug" )( "dpac:services.pages" );
const _ = require( "lodash" );
const keystone = require( "keystone" );
const collection = keystone.list( "Page" );
const Service = require( "./helpers/Service" );
const base = new Service( collection, debug );
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
