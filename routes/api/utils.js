'use strict';
var _ = require( 'underscore' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.utils' );
var keystone = require( 'keystone' );

//-- taken from 'errors' module
var isHttpError = module.exports.isHttpError = function isHttpError( err ){
  return err && err.hasOwnProperty( 'explanation' ) && err.hasOwnProperty( 'code' );
};
//--

function diff( original,
               modified,
               editable ){
  var results = [];
  _.map( modified, function( item,
                             key ){
    /* jshint eqeqeq:false */
    if( original[key] != item ){ //yeah, we _really_ want non-strict equality comparison here
      /* jshint eqeqeq:true */
      results.push( key );
    }
  } );
  return results;
}

module.exports.verifyChangesAllowed = function verifyChangesAllowed( modified,
                               editable ){
  return function validateChanges( doc ){
    var differences = diff( doc.toJSON(), modified );
    var notallowed = _.difference( differences, editable );
    if( notallowed && notallowed.length ){
      throw new errors.Http422Error( { reason : "Modification not allowed for: '" + notallowed.join( "', '" ) + "'" } );
    }
    return doc;
  };
};
