"use strict";
var _ = require( "underscore" );
var errors = require( "errors" );
var debug = require( "debug" )( "dpac:api.utils" );
var keystone = require( "keystone" );

// taken from 'errors' module
module.exports.isHttpError = function isHttpError( err ){
  return err && err.hasOwnProperty( "explanation" ) && err.hasOwnProperty( "code" );
};

function diff( original,
               modified ){
  var results = [];
  _.map( modified, function( item,
                             key ){
    /* jshint eqeqeq:false */
    if( original[ key ] != item ){ // yeah, we _really_ want non-strict equality comparison here
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
      throw new errors.Http422Error( {
        explanation : [ "Modification not allowed for: '" + notallowed.join( "', '" ) + "'" ]
      } );
    }

    return doc;
  };
};

/**
 *
 * @param opts
 * @param opts.fields [Required] Array of field names that will be updated, all other values
 *  will be ignored [!] for security reasons
 * @param opts.values [Optional] Object containing key value pairs that correspond to schema fields,
 *  if none supplied req.param will be used on `opts.fields` to populate the `values` object
 * @param req
 * @returns {*}
 */
module.exports.parseValues = function( opts,
                                       req ){
  if( !opts.fields ){
    throw new Error( "`opts.fields` is required!" );
  }
  var temp = {};
  _.each( opts.fields, function( field ){
    var value = req.param( field );

    if( value ){
      temp[ field ] = value;
    }
  } );

  return _.defaults( opts.values || {}, temp );
};
