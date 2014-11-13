'use strict';

var path = require( 'path' );
var pkg = require( '../package.json' );
var fs = require( 'fs' );

var src = path.resolve( path.join( __dirname, 'report.js' ) );
var dest = path.resolve( path.join( __dirname, "../updates", pkg.version + "-report-"+ Date.now() + ".js" ) );
fs.createReadStream( src ).pipe( fs.createWriteStream( dest ) );
