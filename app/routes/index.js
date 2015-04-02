/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre("routes") and pre("render") events.
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

var _ = require( "underscore" );
var keystone = require( "keystone" );
var appMw = require( "./middleware" );
var importRoutes = keystone.importer( __dirname );

// Common Middleware
keystone.pre( "routes", appMw.initLocals );
keystone.pre( "render", appMw.flashMessages );

// Import Route Controllers
var routes = {
  views : importRoutes( "./views" ),
  api   : importRoutes( "./api" )
};
var api = routes.api;
var apiMw = api.helpers.middleware;
var registerDefaultRoutes = api.helpers.registerDefaultRoutes;

// Setup Route Bindings
exports = module.exports = function( app ){
  // Views
  app.get( "/", routes.views.index );
  //app.get( "/blog/:category?", routes.views.blog );
  //app.get( "/blog/post/:post", routes.views.post );
  app.get( '/content/:page', routes.views.page );
  app.all( "/contact", routes.views.contact );

  // # REST API

  // -- API setup --
  app.route( "/api*" )
    .all( appMw.reflectReq )
    .all( apiMw.initAPI );

  app.route( "/api/session" )
    .get( api.authentication.status )
    .post( apiMw.requireParams( "email", "password" ) )
    .post( api.authentication.signin )
    .delete( apiMw.requireUser )
    .delete( api.authentication.signout );

  app.route( "/api/user" )
    .all( apiMw.requireUser )
    .all( apiMw.setIdParamToUser )
    .get( api.users.retrieve )
    .patch( api.users.update );

  app.route( "/api/user/assessments" )
    .all( apiMw.requireUser )
    .all( apiMw.setIdParamToUser )
    .get( api.users.listAssessments );

  app.route( "/api/user/mementos" )
    .all( apiMw.requireUser )
    .all( apiMw.setIdParamToUser )
    .get( api.users.listMementos );

  app.route( "/api/mementos" )
    .all( apiMw.requireUser )
    .post( apiMw.requireParams( "assessment" ) )
    .post( api.mementos.create );

  app.route( "/api/phases" )
    .all( apiMw.requireUser )
    .get( api.phases.list );

  app.route( "/api/representations" )
    .all( apiMw.requireUser )
    .get( api.representations.list );
  app.route( "/api/representations/:_id" )
    .all( apiMw.requireUser )
    .get( api.representations.retrieve );

  registerDefaultRoutes( "/api/assessments",
    app, {
      all        : [ apiMw.requireUser, apiMw.requireAdmin ],
      controller : api.assessments
    } );

  registerDefaultRoutes( "/api/documents",
    app, {
      all        : [ apiMw.requireUser, apiMw.requireAdmin ],
      controller : api.documents
    } );

  registerDefaultRoutes( "/api/users",
    app, {
      all        : [ apiMw.requireUser, apiMw.requireAdmin ],
      controller : api.users
    } );

  registerDefaultRoutes( "/api/comparisons",
    app, {
      all        : [ apiMw.requireUser, apiMw.requireAdmin ],
      controller : api.comparisons
    } );

  registerDefaultRoutes( "/api/timelogs",
    app, {
      all        : [ apiMw.requireUser, apiMw.requireAdmin ],
      controller : api.timelogs
    } );

  // -- API fallback --
  app.all( "/api*", apiMw.methodNotAllowed );
  app.all( "/api*", apiMw.handleError );
};
