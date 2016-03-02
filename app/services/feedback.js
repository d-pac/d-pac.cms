"use strict";
const debug = require( "debug" )( "dpac:services.notes" );
const keystone = require( "keystone" );
const schema = keystone.list( "Feedback" );
const Service = require( "./helpers/Service" );
const representationsService = require( './representations' );
const base = new Service( schema );
module.exports = base.mixin();

module.exports.listByRepresentations = ( opts, representationIds ) =>{
  debug( '#listByRepresentations', opts );
  return base.list( opts )
      .where( "representation" ).in( representationIds )
      .exec();
};
