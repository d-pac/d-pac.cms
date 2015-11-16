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

module.exports.init = function(){
  keystone.list( 'Document' ).schema.pre( 'remove', removingDocumentHandler );
};
