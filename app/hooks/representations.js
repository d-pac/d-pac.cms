'use strict';
var _ = require( 'lodash' );
var P = require( 'bluebird' );
var keystone = require( 'keystone' );

var representationsService = require( '../services/representations' );
var comparisonsService = require( '../services/comparisons' );

function representationRemovedHandler( done ){
  var representation = this;
  comparisonsService.listForRepresentation( representation )
    .each( function( comparison ){
      return comparison.remove();
    } )
    .then(function(){
      done();
    })
    .catch(function(err){
      done(err);
    });
}

module.exports.init = function(){
  keystone.list( 'Representation' ).schema.pre( 'remove', representationRemovedHandler );
};
