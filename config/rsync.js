'use strict';

module.exports = {
  options : {
    exclude   : ['.git*', '.DS_store'],
    recursive : true
  },
  app     : {
    options : {
      src                : './', //trailing slash REQUIRED [!]
      dest               : '<%= env.REMOTE_DEST %>',
      host               : ['<%= env.REMOTE_USERNAME %>', '@', '<%= env.REMOTE_HOST %>'].join( '' ),
      exclude            : ['*-mocks.js'],
      syncDestIgnoreExcl : true
    }
  }
};