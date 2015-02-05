"use strict";
var _ = require( "underscore" );
var path = require( "path" );
var pkg = require( "../package.json" );
var fs = require( "fs" );

var source = "add-temp-users.js";
var script = _.template( "<%= version %>-add-temp-users-<%= now %>.js" );

var src = path.resolve( path.join( __dirname, source ) );
var dest = path.resolve( path.join( __dirname, "../updates", script( {
  version : pkg.version,
  now     : Date.now()
} ) ) );
fs.createReadStream( src ).pipe( fs.createWriteStream( dest ) );
