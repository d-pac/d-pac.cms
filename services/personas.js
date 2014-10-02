'use strict';
var debug = require( 'debug' )( 'dpac:services.assessments' );
var keystone = require( 'keystone' );
var Persona = keystone.list( 'Persona' );

/**
 *
 * @param opts
 * @param {string} opts.user User.id
 * @param {string} opts.role Role name
 * @returns {Promise}
 */
module.exports.list = function list( opts ){
  return Persona.model
    .find(opts)
    .populate( 'assessment' )
    .exec();
};
