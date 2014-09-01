'use strict';
var debug = require( 'debug' )( 'dpac:services' );
var keystone = require( 'keystone' );
var Representation = keystone.list( 'Representation' );

module.exports = function retrieveRepresentationPair(next){
  debug( 'retrieveRepresentationPair' );
  Representation.model
    .find()
    .sort( { createdAt : -1 } )
    .limit( 2 )
    .exec( function( err,
                     representations ){
      next(err, representations);
    } );
};
