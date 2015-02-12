"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var debug = require( "debug" )( "dpac:services.users" );
var extend = require( "deep-extend" );
var P = require( "bluebird" );

var schema = keystone.list( "User" );

/**
 *
 * @param opts
 * @param opts._id schema.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieve( opts ){
  debug( "#retrieve" );

  return P.resolve( schema.model
      .findById( opts._id )
      .populate( "organization" )
      .exec() );
};
