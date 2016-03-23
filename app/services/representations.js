"use strict";
var debug = require( "debug" )( "dpac:services.representations" );
var keystone = require( "keystone" );
var _ = require( "lodash" );
var collection = keystone.list( "Representation" );
var Service = require( "./helpers/Service" );
var requireProp = require( './helpers/requireProp' );
var base = new Service( collection );
const constants = require( '../models/helpers/constants' );
module.exports = base.mixin();

module.exports.list = function list( opts ){
  debug( "list" );
  return base.list( opts )
    .populate( "document" )
    .exec();
};

module.exports.listWithoutUser = function( userId,
                                           opts ){
  debug( "listWithoutUser" );
  return base.list( opts )
    .populate( "document" )
    .exec()
    .filter( function( representation ){
      var owner = _.get( representation, [ 'document', 'owner' ] ) || [];
      return owner.indexOf( userId ) < 0;
    } );
};

module.exports.listForUser = function(userId, opts){
  debug( "listWithoutUser" );
  return base.list( opts )
    .populate( "document" )
    .exec()
    .filter( function( representation ){
      var owner = _.get( representation, [ 'document', 'owner' ] ) || [];
      return owner.indexOf( userId ) >= 0;
    } )
    .then((representations)=>{
      return representations;
    })
}

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
