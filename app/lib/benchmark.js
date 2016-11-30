'use strict';
const moment = require( 'moment' );

function log( a,
              b ){
  console.log( `${a.m}: ${a.t.diff( b.t )} ms` );
}

function noop(){
}

const dummy = {
  snap: noop,
  output: noop
};

module.exports = function( immediate,
                           enabled ){
  if( !enabled ){
    return dummy;
  }
  const o = {
    times: [],
    snap: function( message ){
      this.times.push( {
        t: moment(),
        m: message
      } );
      if( immediate && this.times.length > 1 ){
        log( this.times[ this.times.length - 1 ], this.times[ this.times.length - 2 ] );
      }
    },
    output: function(){
      for( let i = 1; i < this.times.length; i++ ){
        log( this.times[ i ], this.times[ i - 1 ] );
      }
    }
  };
  o.snap( 'start' );
  return o;
};
