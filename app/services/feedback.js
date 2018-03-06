"use strict";
const debug = require( "debug" )( "dpac:services.notes" );
const keystone = require( "keystone" );
const collection = keystone.list( "Feedback" );
const Service = require( "./helpers/Service" );
const base = new Service( collection, debug );
module.exports = base.mixin();

module.exports.listByRepresentations = ( opts, representationIds ) =>{
  debug( '#listByRepresentations', opts );
  return base.list( opts )
      .where( "representation" ).in( representationIds )
      .exec();
};

module.exports.listLeanByRepresentations = ( opts, representationIds ) =>{
  debug( '#listByRepresentations', opts );
  return base.list( opts )
    .where( "representation" ).in( representationIds )
    .populate('author')
    .lean()
    .exec();
};
