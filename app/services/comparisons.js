"use strict";
var debug = require( "debug" )( "dpac:services.comparisons" );
var keystone = require( "keystone" );
var _ = require( "underscore" );
var schema = keystone.list( "Comparison" );
var Service = require( "./helpers/Service" );
var base = new Service( schema, module.exports );

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
  if( !opts ){
    opts = {};
  }
  opts.completed = true;

  return schema.model
    .count( opts )
    .exec();
};
