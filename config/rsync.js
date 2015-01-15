"use strict";

module.exports = {
  options : {
    host      : [ "<%= env.REMOTE_USERNAME %>", "@", "<%= env.REMOTE_HOST %>" ].join( "" ),
    args      : [ "--verbose" ],
    recursive : true
  },
  app     : {
    options : {
      src                : "./", // trailing slash REQUIRED [!]
      dest               : "<%= env.REMOTE_DEST %>",
      exclude            : [ "*-mocks.js", "public/assessors", "public/uploads", "logs", ".git*", ".DS_store" ],
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
