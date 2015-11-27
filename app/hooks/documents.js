'use strict';

var _ = require( 'lodash' );
var keystone = require( "keystone" );
var representationsService = require( '../services/representations' );

function removingDocumentHandler( done ){
  var document = this;
  representationsService.list( {
      document: this.id
    } )
    .then( function( representations ){
      if( representations.length ){
        var names = _.pluck( representations, 'name' );
        return done( new Error( 'NOT ALLOWED: it\'s referenced to in representation(s): ' + names.join( ', ' ) ) );
      }
      done();
    } )
    .catch( done );
}

function saveDocumentHandler( done ){
  var document = this;
  if( document.representation ){
    if( !document.assessment ){
      return done( new Error( 'Assessment is required if "Create representation" is checked.' ) );
    }
    representationsService.create( {
        document: document.id,
        assessment: document.assessment
      } )
      .then( function( representation ){
        document.representation = false;
        document.assessment = null;
        done();
      } )
      .catch( function( err ){
        done( err );
      } );
  } else {
    done();
  }
}

module.exports.init = function(){
  keystone.list( 'Document' ).schema.pre( 'remove', removingDocumentHandler );
  keystone.list( 'Document' ).schema.pre( 'save', saveDocumentHandler );
};
