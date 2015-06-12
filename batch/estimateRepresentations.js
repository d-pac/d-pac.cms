'use strict';

var keystone = require( "keystone" );
var P = require( 'bluebird' );
var statsService = require( '../app/services/stats' );

module.exports = function( assessmentId,
                           done ){

  statsService.estimateForAssessment( assessmentId ).then( function( results ){
    console.log( 'Finished' );
    done();
  } ).catch( function( err ){
    done( err );
  } );
};
