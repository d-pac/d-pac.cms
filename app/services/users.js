"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var debug = require( "debug" )( "dpac:services.users" );
var extend = require( "deep-extend" );
var P = require( "bluebird" );

var schema = keystone.list( "User" );
var Service = require( "./helpers/Service" );

var base = new Service( schema );

/**
 *
 * @param opts
 * @param opts._id schema.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieve( opts ){
  debug( "#retrieve", opts );

  return base.retrieve( opts )
    .populate( "organization" )
    .execAsync();
};
