'use strict';

var _ = require( 'lodash' );

function throwErr( err ){
  if( err ){
    throw err;
  }
}

module.exports = function handleHook( handler ){
  return function( mixed ){
    let done, arg;
    if( mixed ){
      if( _.isFunction( mixed ) ){
        done = mixed;
        arg = this;
      } else {
        done = throwErr;
        arg = mixed;
      }
    }
    handler( arg )
      .then( function(){
        done();
      } )
      .catch( function( err ){
        done( err );
      } );
  }
};
