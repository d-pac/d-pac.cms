'use strict';

const _ = require( 'lodash' );
const P = require( 'bluebird' );
const keystone = require( 'keystone' );
const representationServices = require( '../services/representations' );
const notesService = require( '../services/notes' );
const handleHook = require('./helpers/handleHook');

function removeComparisonsForRepresentation( representation ){
  return comparisonsService.listForRepresentation( representation )
    .mapSeries( function( comparison ){
      return comparison.remove();
    } );
}


module.exports.init = function(){
  keystone.list( 'Representation' ).schema.pre( 'remove', handleHook(removeComparisonsForRepresentation) );
};
