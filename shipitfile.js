var _ = require( "lodash" );
var manifests = require( "require-directory" )( module, "./shipping" );
var fs = require( "fs" );
var path = require( 'path' );

module.exports = function( shipit ){
  var config = _.defaults( {
    default: {
      ignores: [ "app/uploads", ".DS_Store" ]
    }
  }, manifests );

  shipit.initConfig( config );

  shipit.blTask( "transfer-app", function(){
    var processEnv = "process." + this.options.environment + ".json";
    var files = [ processEnv ];
    var processConfig = require( './' + processEnv );
    var envs = _.pluck( processConfig.apps, [ "env", "NODE_ENV" ] );
    envs.forEach( function( env ){
      var envFile = ".env." + env;
      if( fs.existsSync( envFile ) ){
        files.push( envFile );
      }
    } );

    files = files.concat( [
      "app",
      "package.json",
      "npm-shrinkwrap.json",
      ".env"
    ] );

    files = files.join( " " );
    var dest = this.config.options.dest;
    return shipit.remoteCopy( files, dest );
  } );

};
