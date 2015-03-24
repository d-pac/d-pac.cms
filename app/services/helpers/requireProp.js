"use strict";
var _ = require( "underscore" );

/**
 *
 * @param {{}} obj
 * @param {String} prop
 */
module.exports = function requireProp( obj,
                                      prop ){
  var args = _.flatten( _.toArray( arguments ) );
  obj = ( obj )
    ? args.shift() // drop `obj`
    : {};
  _.each( args, function( prop ){
    if( !obj.hasOwnProperty( prop ) ){
      throw new Error( '`' + prop + '` is a required property' );
    }
  } );
};
