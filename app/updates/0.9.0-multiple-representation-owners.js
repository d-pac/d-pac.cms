"use strict";
const _ = require( 'lodash' );
const documentsService = require( '../services/documents' );
const log = _.partial( console.log, require( 'path' ).basename( __filename ) + ':' );

module.exports = ( done ) =>{
  let n = 0;
  documentsService.list( {
      owner: {
        $exists: true
      }
    } )
    .map( ( document ) =>{
      n++;
      if(document.owner === null){
        document.owner = [];
      }
      return document.save();
    } )
    .then( ()=>{
      log( 'Updated', n, 'documents' );
      done();
    } )
    .catch( ( err )=>{
      console.log( 'err', err );
      done( err );
    } )
};
