"use strict";

module.exports = function( grunt,
                           opts ){
  return {
    tasks : {
      jshint : {
        "options" : {
          "reporter" : require( "jshint-stylish" ),
          "force"    : false,
          "jshintrc" : ".jshintrc"
        },
        "all"     : [
          "routes/**/*.js",
          "models/**/*.js"
        ],
        "server"  : [
          "<%= paths.entrypoint %>"
        ]
      },

      jscs : {
        "src"     : [
          "models/*.js",
          "routes/*.js",
          "services/*.js"
        ],
        "options" : {
          "config"    : ".jscsrc",
          "maxErrors" : 1
        }
      }
    }
  };
};
