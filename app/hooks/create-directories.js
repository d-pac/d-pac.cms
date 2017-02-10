'use strict';

const _ = require( 'lodash' );
const mkdir = require( 'mkdir-p' );
const keystone = require( 'keystone' );

const constants = require( '../models/helpers/constants' );

function createDirectories( done ){
  const dirs = _.values( constants.directories );
  _.forEach( dirs, function( dir ){
    try{
      mkdir.sync( dir );
    } catch( e ) {
      return done( e );
    }
  } );
  done();
}

module.exports.init = function(){
  keystone.pre( 'updates', createDirectories );
};
