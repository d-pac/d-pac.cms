'use strict';

const keystone = require( 'keystone' );
const comparisonsService = require( '../services/comparisons' );
const handleHook = require('./helpers/handleHook');

function removeComparisonsForRepresentation( representation ){
  return comparisonsService.listForRepresentation( representation )
    .mapSeries( ( comparison )=>comparison.remove() );
}


module.exports.init = function(){
  keystone.list( 'Representation' ).schema.pre( 'remove', handleHook(removeComparisonsForRepresentation) );
};
