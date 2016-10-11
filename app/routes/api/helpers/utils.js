"use strict";
var _ = require( "lodash" );
var errors = require( "errors" );
// var debug = require( "debug" )( "dpac:api.utils" );

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
    if( original[ key ] != item ){ // eslint-disable-line eqeqeq
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
        explanation: [ "Modification not allowed for: '" + notallowed.join( "', '" ) + "'" ]
      } );
    }

    return doc;
  };
};

/**
 *
 * @param {{}} opts - options
 * @param {[]} opts.fields - Array of field names that will be updated, all other values
 *  will be ignored [!] for security reasons
 * @param {[]} [opts.values] - Object containing key value pairs that correspond to schema fields,
 *  if none supplied req.param will be used on `opts.fields` to populate the `values` object
 * @param {{}} req - request
 * @returns {{}} - values
 */
module.exports.parseValues = function( opts,
                                       req ){
  if( !opts.fields ){
    throw new Error( "`opts.fields` is required!" );
  }
  var temp = {};
  _.forEach( opts.fields, function( field ){
    // we need to use _.get since field might be "foo.bar"
    var value = _.get(req.body, field );

    if( value ){
      temp[ field ] = value;
    }
  } );

  return _.defaults( opts.values || {}, temp );
};

module.exports.getResultsByType = ( res,
                                    type ) =>{
  return _.get( res, [ 'locals', 'results' ], [] )
    .filter( ( item ) =>{
      return item.type === type;
    } );
};
