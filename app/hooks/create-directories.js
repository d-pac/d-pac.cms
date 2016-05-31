'use strict';

var _ = require( 'lodash' );
var fs = require( 'fs' );
var keystone = require('keystone');

var constants = require( '../models/helpers/constants' );

function createDirectories( done ){
  var dirs = [ 'app/uploads' ].concat( _.values(constants.directories) );
  _.forEach( dirs, function( dir ){
    try{
      fs.mkdirSync( dir );
    } catch( e ) {
      if( e.code !== 'EEXIST' ){
        return done( e );
      }
    }
  } );
  done();
}



module.exports.init = function(){
  keystone.pre( 'updates', createDirectories );
};
