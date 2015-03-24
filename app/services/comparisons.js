"use strict";
var debug = require( "debug" )( "dpac:services.comparisons" );
var keystone = require( "keystone" );
var _ = require( "underscore" );
var schema = keystone.list( "Comparison" );
var Service = require( "./helpers/Service" );
var P = require( "bluebird" );
var base = new Service( schema );
module.exports = base.mixin();

/**
 *
 * @param opts
 * @param {string} [opts.assessor] User.id
 * @returns {Promise}
 */
module.exports.listActive = function listActive( opts ){
  debug( "#listActive" );

  opts = _.defaults( opts, {
    completed : false
  } );

  return this.list( opts );
};

module.exports.completedCount = function completedCount( opts ){
  debug( "#completedCount" );
  opts = _.defaults( opts, {
    completed : true
  } );

  return P.promisifyAll(
    schema.model
      .count( opts )
  ).execAsync();
};
