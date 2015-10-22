'use strict';
var P = require( 'bluebird' );
var keystone = require( 'keystone' );
var representationServices = require( '../services/representations' );

function comparisonRemovedHandler( next ){
  var comparison = this;
  P.join( representationServices.retrieve( {
    _id: comparison.representations.a
  } ), representationServices.retrieve( {
    _id: comparison.representations.b
  } ), function( repA,
                 repB ){
    return repA.uncompareWith( repB );
  } ).then( function(){
    next();
  } ).catch( function( err ){
    next( err );
  } )
}

module.exports.init = function(){
  keystone.list( 'Comparison' ).schema.pre( 'remove', comparisonRemovedHandler );
};
