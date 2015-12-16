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

var keystone = require( "keystone" );
var appMw = require( "./middleware" );
var importRoutes = keystone.importer( __dirname );

// Common Middleware
keystone.pre( "routes", appMw.initLocals );
keystone.pre( "render", appMw.flashMessages );

// Import Route Controllers
var routes = {
  views: importRoutes( "./views" ),
  api: importRoutes( "./api" )
};
var api = routes.api;
var apiMw = api.helpers.middleware;
var registerDefaultRoutes = api.helpers.registerDefaultRoutes;
var initCORS = apiMw.createCors();

// Setup Route Bindings
exports = module.exports = function( app ){
  var apiRoot = keystone.get( "api root" );

  app.use( initCORS );
  app.use( keystone.express.static( __dirname + '/../uploads' ) );

  app.use( '/reports', apiMw.requireUser, apiMw.requireAdmin, keystone.express.static( __dirname + '/../reports' ) );

  // Views
  app.get( "/", routes.views.index );
  //app.get( "/blog/:category?", routes.views.blog );
  //app.get( "/blog/post/:post", routes.views.post );
  app.get( '/content/:page', routes.views.page );
  app.all( "/contact", routes.views.contact );

  // # REST API

  // -- API setup --
  app.route( apiRoot + "*" )
    .all( appMw.reflectReq )
    .all( apiMw.initAPI );

  app.route( apiRoot + "/system/:action" )
    .get( api.system.action );

  app.route( apiRoot + "/session" )
    .get( api.authentication.status )
    .post( api.authentication.signin )
    .delete( apiMw.requireUser )
    .delete( api.authentication.signout );

  app.route( apiRoot + "/user" )
    .all( apiMw.requireUser )
    .all( apiMw.setIdParamToUser )
    .get( api.users.retrieve )
    .patch( api.users.update );

  app.route( apiRoot + "/user/assessments" )
    .all( apiMw.requireUser )
    .all( apiMw.setIdParamToUser )
    .get( api.users.listAssessments );

  app.route( apiRoot + "/user/assessments/:role" )
    .all( apiMw.requireUser )
    .all( apiMw.setIdParamToUser )
    .get( api.users.listAssessments );

  app.route( apiRoot + "/user/comparisons" )
    .all( apiMw.requireUser )
    .all( apiMw.setIdParamToUser )
    .get( api.users.listIncompleteComparisons,
      api.comparisons.includeRepresentations,
      api.users.includeNotes );

  app.route( apiRoot + "/user/notes" )
    .all( apiMw.requireUser )
    .all( apiMw.setIdParamToUser )
    .get( api.users.listNotes );

  app.route( apiRoot + "/phases" )
    .all( apiMw.requireUser )
    .get( api.phases.list );

  app.route( apiRoot + "/pages" )
    .get( api.pages.list );
  app.route( apiRoot + "/pages/:slug" )
    .get( api.pages.retrieve );

  app.route( apiRoot + "/representations" )
    .all( apiMw.requireUser )
    .get( api.representations.list );
  app.route( apiRoot + "/representations/:_id" )
    .all( apiMw.requireUser )
    .get( api.representations.retrieve );

  app.route( apiRoot + "/messages" )
    .all( apiMw.requireUser )
    .post( api.messages.create );

  registerDefaultRoutes( apiRoot + "/assessments",
    app, {
      'pre:all': [ apiMw.requireUser, apiMw.requireAdmin ],
      controller: api.assessments
    } );

  registerDefaultRoutes( apiRoot + "/documents",
    app, {
      'pre:all': [ apiMw.requireUser, apiMw.requireAdmin ],
      controller: api.documents
    } );

  registerDefaultRoutes( apiRoot + "/users",
    app, {
      'pre:all': [ apiMw.requireUser, apiMw.requireAdmin ],
      controller: api.users
    } );

  registerDefaultRoutes( apiRoot + "/comparisons",
    app, {
      'pre:all': [ apiMw.requireUser ],
      controller: api.comparisons,
      'post:create': [ api.comparisons.includeRepresentations ]
    } );

  registerDefaultRoutes( apiRoot + "/notes",
    app, {
      'pre:all': [ apiMw.requireUser ],
      controller: api.notes
    } );

  registerDefaultRoutes( apiRoot + "/timelogs",
    app, {
      'pre:list': [ apiMw.requireUser ],
      'pre:create': [ apiMw.requireUser ],
      'pre:retrieve': [ apiMw.requireUser ],
      'pre:remove': [ apiMw.requireUser ],
      controller: api.timelogs
    } );

  registerDefaultRoutes( apiRoot + "/organizations",
    app, {
      'pre:all': [ apiMw.requireUser, apiMw.requireAdmin ],
      controller: api.organizations
    } );

  // -- API fallback --
  app.all( apiRoot + "*", apiMw.methodNotAllowed );
  app.use( apiMw.handleError );
};
