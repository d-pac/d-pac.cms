"use strict()";

var konfy = require( "konfy" );

var semver = require( "semver" );

module.exports = function( grunt ){
  if( grunt.option( "env" ) ){
    process.env.NODE_ENV = grunt.option( "env" );
  }
  konfy.load( function( err,
                        data ){
    console.log( "err", err );
  } );

  // Time how long tasks take. Can help when optimizing build times
  require( "time-grunt" )( grunt );

  // Load grunt tasks automatically
  require( "jit-grunt" )( grunt, {
    "bump-only"   : "grunt-bump",
    "bump-commit" : "grunt-bump",
    "mochacli"    : "grunt-mocha-cli",
    "buildnumber" : "grunt-build-number"
  } );

  var configs = require( "load-grunt-configs" )( grunt, {
    pkg         : grunt.file.readJSON( "package.json" ),
    paths       : {
      entrypoint : "server.js"
    },
    env         : process.env,
    buildnumber : {
      files : [ "package.json" ]
    }
  } );

  // Project configuration.
  grunt.initConfig( configs );

  // load jshint
  grunt.registerTask( "lint", [
    "jshint", "jscs"
  ] );

  // default option to connect server
  grunt.registerTask( "serve", function(){
    var target = process.env.NODE_ENV || "development";
    grunt.task.run( [
      "lint",
      "buildnumber",
      "concurrent:" + target
    ] );
  } );

  grunt.registerTask( "release", function( versionOrType ){
    var bumpTask = "bump-only";

    if( !versionOrType ){
      bumpTask += ":patch";
    } else if( semver.clean( versionOrType ) ){
      grunt.option( "setversion", versionOrType );
    } else {
      bumpTask += ":" + versionOrType;
    }

    grunt.task.run( [
      "lint", bumpTask, "bump-commit"
    ] );
  } );

  grunt.registerTask( "test", [
    "mochacli"
  ] );

  grunt.registerTask( "publish", [ "apidoc", "gh-pages" ] );

  grunt.registerTask( "deploy", [ "buildnumber", "rsync:app" ] );
};
