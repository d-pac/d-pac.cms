"use strict";

var reporter = "comparisons-report.js";
var script = "<%= version %>-report-comparisons-<%= now %>.js";

var _ = require( "underscore" );
var path = require( "path" );
var pkg = require( "../package.json" );
var fs = require( "fs" );

var src = path.resolve( path.join( __dirname, reporter ) );
var dest = path.resolve( path.join( __dirname, "../updates", _.template( script, {
  version : pkg.version,
  now     : Date.now()
} ) ) );
fs.createReadStream( src ).pipe( fs.createWriteStream( dest ) );
