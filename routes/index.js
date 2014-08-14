/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var _ = require( 'underscore' ),
  keystone = require( 'keystone' ),
  middleware = require( './middleware' ),
  importRoutes = keystone.importer( __dirname );
var errors = require( 'errors' );

// Common Middleware
keystone.pre( 'routes', middleware.initLocals );
keystone.pre( 'render', middleware.flashMessages );

// Import Route Controllers
var routes = {
  views : importRoutes( './views' ),
  api   : importRoutes( './api' )
};

// Setup Route Bindings
exports = module.exports = function( app ){
  //console.log(errors);
  // Views
  app.get( '/', routes.views.index );
  app.get( '/blog/:category?', routes.views.blog );
  app.get( '/blog/post/:post', routes.views.post );
  app.all( '/contact', routes.views.contact );

  // # REST API
  var api = routes.api;
  app.all( '/api*', api.middleware.initAPI, api.middleware.requireUser );

  // ## Users
  app.get('/api/users', api.middleware.requireAdmin, api.users.controller.list);

  app.all( '/api/users/:id', api.users.middleware.parseUserId, api.users.middleware.requireSelf );

  app.get( '/api/users/:id', api.users.controller.retrieve );
  app.patch( '/api/users/:id', api.users.controller.update );

  app.all( '/api/users*', api.middleware.onlyAllow('GET, PATCH') );

  app.all( '/api*', api.middleware.handleError );

  // NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
  // app.get('/protected', middleware.requireUser, routes.views.protected);

};
