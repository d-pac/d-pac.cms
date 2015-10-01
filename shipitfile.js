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
    var envEnv = ".env." + this.options.environment;
    var files = [
      processEnv,
      envEnv,
      "app",
      "package.json",
      "npm-shrinkwrap.json",
      "headstone.json",
      ".env"
    ];

    files = files.join( " " );
    var dest = this.config.options.dest;
    return shipit.remoteCopy( files, dest );
  } );
};
