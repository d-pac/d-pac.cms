"use strict";
const debug = require( "debug" )( "dpac:services.notes" );
const keystone = require( "keystone" );
const schema = keystone.list( "Feedback" );
const Service = require( "./helpers/Service" );
const representationsService = require( './representations' );
const base = new Service( schema );
module.exports = base.mixin();

module.exports.listByDocuments = ( opts,
                                   documentIds ) =>{
  debug( "#listByDocuments", opts, documentIds );
  return base.list( opts )
    .where( "document" ).in( documentIds )
    .exec();
};

module.exports.listByRepresentation = ( opts ) =>{
  debug( '#listByRepresentation', opts );
  return representationsService.retrieve( { _id: opts.representation } )
    .then( ( representation ) =>{
      if( representation ){
        return module.exports.list( { document: representation.document } );
      }
    } );
};
