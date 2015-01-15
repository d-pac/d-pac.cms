"use strict";
var debug = require( "debug" )( "dpac:services.comparisons" );
var keystone = require( "keystone" );
var _ = require( "underscore" );
var extend = require( "deep-extend" );
var Bluebird = require( "bluebird" );
var schema = keystone.list( "Comparison" );

module.exports.create = function createComparison( opts ){
  debug( "#create" );

  return schema.model.create( opts );
};

/**
 *
 * @param opts
 * @param {string} [opts.assessor] User.id
 * @returns {Promise}
 */
module.exports.listActive = function listActive( opts ){
  debug( "#listActive" );

  return schema.model
    .find( opts )
    .where( "completed" ).ne( true ) // we want all falsy matches as well
    .populate( "assessment" )
    .lean()
    .exec();
};

/**
 *
 * @param opts
 * @param {string} opts._id Comparison.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieve( opts ){
  return schema.model
    .findById( opts._id )
    .lean()
    .exec();
};

/**
 *
 * @param opts
 * @param {string} opts._id Comparison.id
 */
module.exports.update = function update( opts ){
  debug( "update" );

  return schema.model
    .findById( opts._id )
    .exec()
    .then( function( doc ){
      if( !doc ){
        return;
      }
      extend( doc, opts );
      var save = Bluebird.promisify( doc.save, doc );

      return save();
    } );
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
