"use strict";
var path = require( "path" );
var pkg = require( "../package.json" );
var fs = require( "fs" );

var src = path.resolve( path.join( __dirname, "mixed-assessments.js" ) );
var dest = path.resolve( path.join( __dirname, "../updates", pkg.version + "-mixed-assessments.js" ) );
fs.createReadStream( src ).pipe( fs.createWriteStream( dest ) );
