"use strict";

module.exports = function( grunt,
                           opts ){
  var dirs = [
    "app**/*.js"
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
