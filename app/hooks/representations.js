'use strict';
var _ = require( 'lodash' );
var P = require( 'bluebird' );
var keystone = require( 'keystone' );

var representationsService = require( '../services/representations' );
var comparisonsService = require( '../services/comparisons' );

const handleHook = require( './helpers/handleHook' );

function uncompareRepresentationsForComparison( comparison ){
  return P.props( {
      a: representationsService.retrieve( {
        _id: comparison.representations.a
      } ),
      b: representationsService.retrieve( {
        _id: comparison.representations.b
      } )
    } )
    .then( ( representations )=>{
      if( representations.a && representations.b ){
        return representations.a.uncompareWith( representations.b );
      }
    } );
}

function compareRepresentationsForComparison( comparison ){
  if( !comparison.isNew ){
    return P.resolve();
  }
  return P.props( {
      a: representationsService.retrieve( {
        _id: comparison.representations.a
      } ),
      b: representationsService.retrieve( {
        _id: comparison.representations.b
      } )
    } )
    .then( ( representations )=> representations.a.compareWith( representations.b ) );
}

module.exports.init = function(){
  keystone.list( 'Comparison' ).schema.pre( 'remove', handleHook( uncompareRepresentationsForComparison ) );
  keystone.list( 'Comparison' ).schema.pre( 'save', handleHook( compareRepresentationsForComparison ) );

};
