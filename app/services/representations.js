"use strict";
var debug = require( "debug" )( "dpac:services.representations" );
var keystone = require( "keystone" );
var _ = require( "lodash" );
var documentsService = require( './documents' );
var collection = keystone.list( "Representation" );
var Service = require( "./helpers/Service" );
var base = new Service( collection );
const constants = require( '../models/helpers/constants' );
module.exports = base.mixin();

module.exports.list = function list( opts ){
  debug( "list" );
  return base.list( opts )
    .populate( "document" )
    .exec();
};

module.exports.listByDocuments = function( documents,
                                           opts ){
  var ids = documents.map( ( document )=>{
    return document.id;
  } );
  return module.exports.list( _.defaults( {
    document: { $in: ids }
  }, opts ) );
};

module.exports.listWithoutUser = function( userId,
                                           opts ){
  debug( "listWithoutUser" );

  return base.list( _.defaults( {}, {
    "document.owner": { $ne: userId }
  }, opts ) )
    .lean()
    .exec();
};

module.exports.listForUser = function( userId,
                                       opts ){
  debug( "listForUser" );
  return documentsService.list( { owner: userId } )
    .then( ( documents )=> module.exports.listByDocuments( documents, opts ) );
};

module.exports.listById = function listById( opts ){
  debug( "listById" );
  return base.listById( opts )
    .populate( "document" )
    .exec();
};

module.exports.retrieve = function list( opts ){
  debug( "list" );
  return base.retrieve( opts )
    .populate( "document" )
    .exec();
};

module.exports.countToRanks = function countToRanks( opts ){
  debug( "countToRanks" );
  return this.count( _.defaults( {}, opts, {
    rankType: constants.TO_RANK
  } ) );
};
