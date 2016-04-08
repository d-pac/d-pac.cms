'use strict';

const keystone = require('keystone');
const notesService = require('../services/notes');
const handleHook = require('./helpers/handleHook');

function removeNotesForDocument(document){
  return notesService.list( {
      document: document.id
    } )
    .mapSeries( ( note )=>note.remove() );
}

module.exports.init = function(){
  keystone.list( 'Document' ).schema.pre( 'remove', handleHook( removeNotesForDocument ) );
};
