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

  //api:setup
  app.all( '/api*',
    middleware.reflectReq,
    api.middleware.initAPI,
    api.middleware.factories.initCORS() );

  //session:retrieve
  app.get( '/api/session', api.sessions.retrieve );

  //sessions:create
  app.post( '/api/session', api.sessions.create );

  //sessions:destroy
  app.del( '/api/session',
    api.middleware.requireUser,
    api.sessions.destroy );

  //users:list
  app.all( '/api/users*', api.middleware.requireUser );
  app.get( '/api/users',
    api.middleware.requireAdmin,
    api.users.list );

  //users:retrieve
  app.all( '/api/users/:id',
    api.middleware.parseUserId,
    api.middleware.requireSelf );
  app.get( '/api/users/:id', api.users.retrieve );

  //users:update
  app.put( '/api/users/:id', api.users.replace );
  app.patch( '/api/users/:id', api.users.update );

  //users:fallthrough
  app.all( '/api/users*', api.middleware.factories.onlyAllow( 'GET, PATCH, PUT' ) );

  //comparisons:setup
  app.all( '/api/comparisons*', api.middleware.requireUser );

  //comparisons:retrieve:current
  app.get( '/api/comparisons/actions/current', api.comparisons.actions.retrieveCurrent );

  //comparisons:retrieve:next
  app.get( '/api/comparisons/actions/next',
    api.middleware.factories.requireParam( 'assessment' ),
    api.middleware.factories.requirePersona( 'assessor' ),
    api.comparisons.actions.retrieveNext
  );

  //api:fallthrough
  app.all( '/api*', api.middleware.notFound, api.middleware.handleError );

  // ## Comparisons

  //

  // NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
  // app.get('/protected', middleware.requireUser, routes.views.protected);

};
