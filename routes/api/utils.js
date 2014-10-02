'use strict';
var _ = require( 'underscore' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.utils' );
var keystone = require( 'keystone' );
var Persona = keystone.list( 'Persona' );
var Assessment = keystone.list( 'Assessment' );

//-- taken from 'errors' module
var isHttpError = module.exports.isHttpError = function isHttpError( err ){
  return err && err.hasOwnProperty( 'explanation' ) && err.hasOwnProperty( 'code' );
};
//--
