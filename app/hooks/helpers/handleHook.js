'use strict';

var _ = require( 'lodash' );

module.exports = function handleHook( handler ){
  if( typeof handler !== 'function' ){
    throw new TypeError( 'Handler of type "Function" expected.' );
  }
  return function( mixed ){
    let done, arg;
    if( mixed ){
      if( typeof mixed === 'function' ){
        done = mixed;
        arg = this;
      } else {
        arg = mixed;
      }
    }
    handler( arg ).asCallback( done );
  }
};
