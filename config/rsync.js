"use strict";

var _ = require( "underscore" );

module.exports = function( grunt,
                           options ){
  var devDeps = _.keys( options.pkg.devDependencies ).map( function( dep ){
    return "node_modules/" + dep;
  } );

  return {
    options : {
      host      : [ "<%= env.REMOTE_USERNAME %>", "@", "<%= env.REMOTE_HOST %>" ].join( "" ),
      args      : [ "--verbose" ],
      recursive : true
    },
    app     : {
      options : {
        src                : "./", // trailing slash REQUIRED [!]
        dest               : "<%= env.REMOTE_DEST %>",
        exclude            : [
          "*-mocks.js", "public/assessors", "public/uploads", "logs", ".git*", ".DS_Store", "Gruntfile.js", "config",
          "apidoc.json", ".editorconfig", ".grunt", ".idea", ".jscsrc", ".jshintrc", "templates"
        ].concat( devDeps ),
        dryRun             : false,
        syncDestIgnoreExcl : true
      }
    },
    uploads : {
      options : {
        src     : "./public/uploads/",
        dest    : "<%= env.REMOTE_DEST %>/public/uploads",
        exclude : [ ".DS_store" ]
      }
    }
  };
};
