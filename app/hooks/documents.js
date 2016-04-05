'use strict';

var _ = require( 'lodash' );
const P = require( 'bluebird' );
var keystone = require( "keystone" );
var representationsService = require( '../services/representations' );
const handleHook = require( './helpers/handleHook' );

function removingDocumentHandler( done ){
  var document = this;
  representationsService.list( {
      document: this.id
    } )
    .then( function( representations ){
      if( representations.length ){
        var names = _.map( representations, 'name' );
        return done( new Error( 'NOT ALLOWED: it\'s referenced to in representation(s): ' + names.join( ', ' ) ) );
      }
      done();
    } )
    .catch( done );
}

function createRepresentation( document ){
  if( !document.representation ){
    return P.resolve();
  }
  if( !document.assessment ){
    return P.reject( new Error( 'Assessment is required if "Create representation" is checked.' ) );
  }
  return representationsService.create( {
      document: document.id,
      assessment: document.assessment
    } )
    .then( function( representation ){
      document.representation = false;
      document.assessment = null;
    } );
}

module.exports.init = function(){
  keystone.list( 'Document' ).schema.pre( 'remove', removingDocumentHandler );
  keystone.list( 'Document' ).schema.pre( 'save', handleHook( createRepresentation ) );
};
