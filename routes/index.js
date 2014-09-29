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
var constants = require('../models/helpers/constants');

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

  //me/sessions:create
  app.post( '/api/me/session',
    api.sessions.create );
  //me:setup
  app.all( '/api/me*',
    api.middleware.requireUser);

  //me/session:retrieve
  app.get( '/api/me/session', api.sessions.retrieve );
  //me/session:destroy
  app.del( '/api/me/session', api.sessions.destroy );
  //me/session:fallthrough
  app.all( '/api/me/session*', api.middleware.factories.onlyAllow( 'GET, POST, DELETE' ) );

  //me/account:setup
  app.all( '/api/me/account*', api.me.prepareForAccount );
  //me/account:retrieve
  app.get( '/api/me/account', api.users.retrieve );
  //me/account:update
  app.put( '/api/me/account', api.users.replace );
  app.patch( '/api/me/account', api.users.update );
  //me/account:fallthrough
  app.all( '/api/me/account*', api.middleware.factories.onlyAllow( 'GET, PATCH, PUT' ) );

  //me/aggregates:setup
  app.all( '/api/me/aggregates*', api.me.prepareForAggregate );
  //me/aggregates:retrieve
  app.get( '/api/me/aggregates', api.me.retrieveActiveAggregates );
  //me/aggregates:create
  app.post( '/api/me/aggregates',
    api.middleware.factories.requireParam( 'assessment' ),
    api.middleware.factories.requirePersona( constants.roles.assessor ),
    api.me.createAggregate
  );
  //me/comparison:fallthrough
  app.all( '/api/me/aggregates*', api.middleware.factories.onlyAllow( 'GET, POST, PUT' ) );

  //me/assessments:list
  app.get( '/api/me/assessments', api.me.retrieveAssessments );
  //me/comparison:fallthrough
  app.all( '/api/me/assessments*', api.middleware.factories.onlyAllow( 'GET' ) );

  //api:fallthrough
  app.all( '/api*', api.middleware.notFound, api.middleware.handleError );

};
