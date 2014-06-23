'use strict()';

var dotenv = require( 'dotenv' );
dotenv.load();

module.exports = function( grunt ){
  // Time how long tasks take. Can help when optimizing build times
  require( 'time-grunt' )( grunt );

  // Load grunt tasks automatically
  require( 'jit-grunt' )( grunt, {

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

  grunt.registerTask( 'server', function(){
    grunt.log.warn( 'The `server` task has been deprecated. Use `grunt serve` to start a server.' );
    grunt.task.run( ['serve:' + target] );
  } );

  grunt.registerTask( 'deploy', ['rsync'] );

};
