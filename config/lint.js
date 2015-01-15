"use strict";

module.exports = function( grunt,
                           opts ){
  var dirs = [
    "models/**/*.js",
    "routes/**/*.js",
    "services/**/*.js",
    "*.js"
  ];

  return {
    tasks : {
      jshint : {
        "options" : {
          "reporter" : require( "jshint-stylish" ),
          "force"    : false,
          "jshintrc" : ".jshintrc"
        },
        "all"     : dirs,
        "server"  : [
          "<%= paths.entrypoint %>"
        ]
      },

      jscs : {
        "src"     : dirs,
        "options" : {
          "config" : ".jscsrc"
        }
      }
    }
  };
};
