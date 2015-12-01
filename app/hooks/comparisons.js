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
    if(repA && repB){
      return repA.uncompareWith( repB );
    }
  } ).then( function(){
    next();
  } ).catch( function( err ){
    next( err );
  } );
}

function comparisonSavedHandler(done){
  var comparison = this;
  if(comparison.isNew){
    P.join( representationServices.retrieve( {
      _id: comparison.representations.a
    } ), representationServices.retrieve( {
      _id: comparison.representations.b
    } ), function( repA,
                   repB ){
      return repA.compareWith( repB );
    } ).then( function(){
      done();
    } ).catch( function( err ){
      done( err );
    } )
  }else{
    done();
  }
}

module.exports.init = function(){
  keystone.list( 'Comparison' ).schema.pre( 'remove', comparisonRemovedHandler );
  keystone.list( 'Comparison' ).schema.pre( 'save', comparisonSavedHandler );
};
