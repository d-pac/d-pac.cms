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
var middleware = require( "./middleware" );
var importRoutes = keystone.importer( __dirname );

// Common Middleware
keystone.pre( "routes", middleware.initLocals );
keystone.pre( "render", middleware.flashMessages );

// Import Route Controllers
var routes = {
  views : importRoutes( "./views" ),
  //api   : importRoutes( "./api" )
};

// Setup Route Bindings
exports = module.exports = function( app ){
  // Views
  app.get( "/", routes.views.index );
  app.get( "/blog/:category?", routes.views.blog );
  app.get( "/blog/post/:post", routes.views.post );
  app.all( "/contact", routes.views.contact );

  // # REST API
  //var api = routes.api;
  //
  //// -- API setup --
  //app.all( "/api*",
  //  middleware.reflectReq,
  //  api.helpers.middleware.initAPI,
  //  api.helpers.middleware.initCORS() );
  //
  //// -- users --
  //
  //app.get( "/api/users",
  //  api.helpers.middleware.requireAdmin,
  //  api.users.list );
  //app.post( "/api/users",
  //  api.helpers.middleware.requireAdmin,
  //  api.users.list );
  //app.get( "/api/users/:_id",
  //  api.helpers.middleware.parseUserId,
  //  api.helpers.middleware.requireSelf,
  //  api.users.retrieve );
  //app.patch( "/api/users/:_id",
  //  api.helpers.middleware.parseUserId,
  //  api.helpers.middleware.requireSelf,
  //  api.users.update );
  //app.get( "/api/user",
  //  api.helpers.middleware.parseUserId,
  //  api.helpers.middleware.requireUser,
  //  api.users.retrieve );
  //app.patch( "/api/user",
  //  api.helpers.middleware.parseUserId,
  //  api.helpers.middleware.requireUser,
  //  api.users.update );
  //
  //// -- authentication --
  //app.get( "/api/user/session", api.authentication.status );
  //app.post( "/api/user/session",
  //  api.helpers.middleware.requireParams( "email", "password" ),
  //  api.authentication.signin );
  //app.delete( "/api/user/session*",
  //  api.helpers.middleware.requireUser,
  //  api.authentication.signout );
  //
  //// -- assessments --
  //app.get( "/api/assessments",
  //  api.helpers.middleware.requireAdmin,
  //  api.assessments.list );
  //app.post( "/api/assessments",
  //  api.helpers.middleware.requireAdmin,
  //  api.assessments.list );
  //
  //// -- API fallback --
  //app.all( "/api*",
  //  api.helpers.middleware.notFound,
  //  api.helpers.middleware.handleError );

};
