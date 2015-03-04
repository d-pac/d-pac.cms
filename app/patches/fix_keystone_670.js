"use strict";
var debug = require( "debug" )( "dpac:patches:" + require( "path" ).basename( __filename ) );
debug( "installing patch for https://github.com/keystonejs/keystone/issues/670" );
var keystone = require( 'keystone' );

keystone.List.prototype.defaultSelectColumns = keystone.List.prototype.selectColumns;
keystone.List.prototype.selectColumns = function( query,
                                                  columns ){
  var list = this;
  var allColumns = columns;
  columns.forEach( function( col ){
    var virtual = list.model.schema.virtuals[ col.path ];
    if( virtual && virtual.depends ){
      // TODO: Check if the column was already added
      allColumns = allColumns.concat( list.expandColumns( virtual.depends ) );
    }
  } );
  return this.defaultSelectColumns( query, allColumns );
};
