var _ = require( "lodash" );
var manifests = require( "require-directory" )( module, "./shipping" );
var fs = require( "fs" );

module.exports = function( shipit ){
  var config = _.defaults( {
    default : {
      ignores : [ "app/uploads", ".DS_Store" ]
    }
  }, manifests );

  shipit.initConfig( config );

  shipit.blTask( "npm-shrinkwrap", function(){
    return shipit.local( "npm prune" ).then( function(){
      return shipit.local( "npm shrinkwrap" );
    } );
  } );

  shipit.blTask( "transfer-app", function(){
    var specEnv = ".env." + this.options.environment;
    var files = ( fs.existsSync( specEnv ) )
      ? [ specEnv ]
      : [];
    files = files.concat( [
      "app",
      "package.json",
      "npm-shrinkwrap.json",
      ".env",
      "process.json"
    ] );

    files = files.join( " " );
    var dest = this.config.options.dest;
    return shipit.remoteCopy( files, dest );
  } );

  shipit.blTask( "npm-install", function(){
    return shipit.remote( "cd " + this.config.options.dest + "; npm install --production" );
  } );

  shipit.blTask( "npm-start", function(){
    return shipit.remote( "cd " + this.config.options.dest + "; npm start" );
  } );
  shipit.blTask( "npm-stop", function(){
    return shipit.remote( "cd " + this.config.options.dest + "; npm stop" );
  } );

  shipit.task( "deploy", [ "transfer-app", "npm-install" ], function(){
    return true;
  } );
};
