'use strict';

var _ = require( 'lodash' );
var fs = require( 'fs' );

var constants = require( '../models/helpers/constants' );

module.exports = function( done ){
  var dirs = [ 'app/uploads' ].concat( constants.directories );
  _.each( dirs, function( dir ){
    try{
      fs.mkdirSync( dir );
    } catch( e ) {
      if( e.code !== 'EEXIST' ){
        return done( e );
      }
    }
  } );
  done();
};
