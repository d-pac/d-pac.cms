'use strict';

var _ = require('lodash');
var fs = require( 'fs' );

var constants = require( '../models/helpers/constants' );

module.exports = function( done ){
  _.each(constants.directories, function( dir ){
    try{
      fs.mkdirSync( dir );
    } catch( e ) {
      if( e.code !== 'EEXIST' ){
        return done(e);
      }
    }
  } );
  done();
};
