"use strict";
var debug = require( "debug" )( "dpac:services.comparisons" );
var keystone = require( "keystone" );
var _ = require( "underscore" );
var extend = require( "deep-extend" );
var P = require( "bluebird" );
var schema = keystone.list( "Comparison" );
var updateResource = require( "./helpers/updateResource" );

module.exports.create = function createComparison( opts ){
  debug( "#create" );

  return P.resolve( schema.model.create( opts ) );
};

/**
 *
 * @param opts
 * @param {string} [opts.assessor] User.id
 * @param {boolean} [active=true]
 * @returns {Promise}
 */
module.exports.listActive = function listActive( opts,
                                                 active ){
  debug( "#listActive" );

  if( "undefined" === typeof active ){
    active = true;
  }

  return P.resolve( schema.model
    .find( opts )
    .where( "completed" ).ne( active ) // we want all falsy matches as well
    .populate( "assessment" )
    .lean()
    .exec() );
};

/**
 *
 * @param opts
 * @param {string} opts._id Comparison.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieve( opts ){
  return P.resolve( schema.model
    .findById( opts._id )
    .lean()
    .exec() );
};

/**
 *
 * @param opts
 * @param {string} opts._id Comparison.id
 */
module.exports.update = function update( opts ){
  debug( "update" );

  return updateResource( schema, opts );
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
