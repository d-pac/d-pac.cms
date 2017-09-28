"use strict";
const debug = require( "debug" )( "dpac:services.representations" );
const keystone = require( "keystone" );
const _ = require( "lodash" );
const documentsService = require( './documents' );
const collection = keystone.list( "Representation" );
const Service = require( "./helpers/Service" );
const base = new Service( collection, debug );
const constants = require( '../models/helpers/constants' );
module.exports = base.mixin();

module.exports.list = function list( opts ){
  return base.list( opts )
    .populate( "document" )
    .exec();
};

module.exports.listLean = function listLean(opts){
  return base.list(opts)
    .lean()
    .exec();
};

module.exports.listByDocuments = function( documents,
                                           opts ){
  const ids = documents.map( ( document ) =>{
    return document.id;
  } );
  return module.exports.list( _.defaults( {
    document: { $in: ids }
  }, opts ) );
};

module.exports.listWithoutUser = function( userId,
                                           opts ){
  debug( "listWithoutUser" );

  const q = _.defaults( {}, {
    document: { $ne: null }
  }, opts );
  return base.list( q )
    .populate( {
      path: "document",
      match: { "owner": { $ne: userId } }
    } )
    .lean()
    .exec()
    .filter( ( representation ) => !!representation.document )
    ;
};

module.exports.listForUser = function( userId,
                                       opts ){
  debug( "listForUser" );
  return documentsService.list( { owner: userId } )
    .then( ( documents ) => module.exports.listByDocuments( documents, opts ) );
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
