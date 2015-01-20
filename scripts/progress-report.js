"use strict";
var keystone = require( "keystone" );
var _ = require( "underscore" );
var objectId = require( "mongoose" ).Types.ObjectId;
var fs = require( "fs" );

var Comparison = keystone.list( "Comparison" );

function listComparisons(){
  return Comparison.model
    .aggregate()
    .group( {
      _id : "$assessor",
      total: {$sum: 1}
    } )
    .project( {
      assessor  : "$_id",
      _id       : 0,
      total : 1
    } )
    .sort( "-total" )
    .exec( function( err,
                     results ){
      if( err ){
        console.error( err );
      }
      console.log( results );

    } );
}

exports = module.exports = function( done ){
  listComparisons()
    .then( function(){
      done();
    } );
};
