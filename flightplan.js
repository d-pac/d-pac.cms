"use strict";

// flightplan.js
var _ = require( "underscore" );
var plan = require( "flightplan" );
var flightManifests = require( "require-directory" )( module, "./flights" );
var packageManifest = require( "./package.json" );
var fs = require( "fs" );

var packages = _.keys( packageManifest.dependencies ).map( function( dep ){
  return "node_modules/" + dep + "/";
} );

_.each( flightManifests, function( config,
                                   targetName ){
  plan.target( targetName, config.target, config.runtime );
} );

plan.local( [ "default", "qa", "qa.app" ], function( transport ){
  transport.log( "Assuring quality" );
  transport.exec( "grunt lint" );
} );
plan.local( [ "default", "deploy", "deploy.app", "deploy.all" ], function( transport ){
  transport.log( "Deploying 'app' to remote" );
  var envFileExists = fs.existsSync( ".env." + plan.runtime.target );
  var files = [
    "models/", "routes/", "scripts/", "services/", "updates/", "public/fonts/", "public/images/", "public/js/",
    "public/styles/", "public/favicon.ico", "templates/",
    ".env", "Gruntfile.js", "nodemon.json", "package.json", "server.js", "npm-shrinkwrap.json"
  ].concat( packages );

  if( envFileExists ){
    files.push( ".env." + plan.runtime.target );
  }
  transport.transfer( files, plan.runtime.options.dest );
} );

plan.local( [ "deploy.uploads", "deploy.all" ], function( transport ){
  transport.log( "Deploying 'uploads' to remote" );
  var files = [
    "public/uploads/"
  ];
  transport.transfer( files, plan.runtime.options.dest );
} );
