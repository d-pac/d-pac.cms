'use strict()';

var dotenv = require( 'dotenv' );
dotenv.load();

var semver = require('semver');

module.exports = function( grunt ){
  // Time how long tasks take. Can help when optimizing build times
  require( 'time-grunt' )( grunt );

  // Load grunt tasks automatically
  require( 'jit-grunt' )( grunt, {
    "bump-only"   : "grunt-bump",
    "bump-commit" : "grunt-bump"
  } );

  var configs = require( 'load-grunt-configs' )( grunt, {
    pkg   : grunt.file.readJSON( 'package.json' ),
    paths : {
      entrypoint : "server.js"
    },
    env   : process.env
  } );

  // Project configuration.
  grunt.initConfig( configs );

  // load jshint
  grunt.registerTask( 'lint', function( target ){
    grunt.task.run( [
      'jshint'
    ] );
  } );

  // default option to connect server
  grunt.registerTask( 'serve', function( target ){
    grunt.task.run( [
      'jshint',
      'concurrent:dev'
    ] );
  } );

  grunt.registerTask('release', function(versionOrType){
 		var bumpTask = 'bump-only';
 		if(!versionOrType){
 			bumpTask += ':patch';
 		}else if(semver.clean(versionOrType)){
 			grunt.option('setversion', versionOrType);
 		}else{
 			bumpTask += ':' + versionOrType;
 		}
 		grunt.task.run([
 			'lint', bumpTask, 'bump-commit'
 		]);
 	});

  grunt.registerTask( 'publish', ['gh-pages'] );

  grunt.registerTask( 'deploy', ['rsync'] );

};
