'use strict';

const _ = require( 'lodash' );
const P = require( 'bluebird' );
const keystone = require( 'keystone' );
const representationServices = require( '../services/representations' );
const notesService = require( '../services/notes' );

function comparisonRemovedHandler( next ){
  let comparison = this;
  P.props( {
      a: representationServices.retrieve( {
        _id: comparison.representations.a
      } ),
      b: representationServices.retrieve( {
        _id: comparison.representations.b
      } )
    } )
    .then( ( representations )=>{
      if( representations.a && representations.b ){
        return representations.a.uncompareWith( representations.b );
      }
    } )
    .then( ()=>next() )
    .catch( ( err )=> next( err ) );
}

function comparisonSavedHandler( done ){
  let comparison = this;
  if( comparison.isNew ){
    P.props( {
        a: representationServices.retrieve( {
          _id: comparison.representations.a
        } ),
        b: representationServices.retrieve( {
          _id: comparison.representations.b
        } )
      } )
      .then( ( representations )=>{
        return representations.a.compareWith( representations.b );
      } )
      .then( ()=> done() )
      .catch( ( err )=> done( err ) )
  } else {
    done();
  }
}

module.exports.init = function(){
  keystone.list( 'Comparison' ).schema.pre( 'remove', comparisonRemovedHandler );
  keystone.list( 'Comparison' ).schema.pre( 'save', comparisonSavedHandler );
};
