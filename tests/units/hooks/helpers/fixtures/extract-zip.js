'use strict';

module.exports = {
  noop: function( opts,
                  callback ){
    callback();
  },
  fail: function( opts,
                  callback ){
    callback( new Error( 'Should fail' ) );
  }
};
