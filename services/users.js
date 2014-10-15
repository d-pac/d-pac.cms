'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var debug = require( 'debug' )( 'dpac:services.users' );
var extend = require('deep-extend');

var Promise = require( 'bluebird' );

var schema = keystone.list( 'User' );

/**
 *
 * @param opts
 * @param opts._id schema.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieve( opts ){
  debug( '#retrieve' );
  return schema.model
    .findById( opts._id )
    .lean()
    .exec();
};

/**
 *
 * @param opts
 * @param {string} opts._id User.id
 * @param {function} validator
 */
var update = module.exports.update = function update( opts ){
  debug( 'update' );
  return schema.model
    .findById( opts._id )
    .exec()
    .then( function( doc ){
      if( !doc ){
        return;
      }
      extend( doc, opts );
      var save = Promise.promisify(doc.save, doc);
      return save();
    } );
};
