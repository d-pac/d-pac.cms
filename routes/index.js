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
var User = keystone.list( 'User' );
var errors = require( 'errors' );
var constants = require( '../models/helpers/constants' );

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

  //ALL /api
  app.all( '/api*',
    middleware.reflectReq,
    api.middleware.initAPI,
    api.middleware.initCORS() );

  app.post( '/api/me/session',
    api.middleware.requireParams( "email", "password" ),
    api.sessions.create );
  app.get( '/api/me/session', api.sessions.retrieve );

  app.all( '/api*',
    api.middleware.requireUser );

  app.del( '/api/me/session*', api.sessions.destroy );
  app.all( '/api/me/session*', api.middleware.onlyAllow( 'GET, POST, DELETE' ) );

  app.get( '/api/me/account', api.users.retrieve );
  app.put( '/api/me/account',
    api.middleware.requireParams( User.api.editable ),
    api.users.replace );
  app.patch( '/api/me/account', api.users.update );
  app.all( '/api/me/account*', api.middleware.onlyAllow( 'GET, PATCH, PUT' ) );

  app.get( '/api/me/mementos', api.me.listMementos );
  app.post( '/api/me/mementos',
    api.middleware.requireParams( "assessment" ),
    api.me.createMemento );
  app.all( '/api/me/mementos*', api.middleware.onlyAllow( 'GET, POST' ) );

  app.get( '/api/me/assessments', api.me.listAssessments );
  app.all( '/api/me/assessments*', api.middleware.onlyAllow( 'GET' ) );

  app.get( '/api/comparisons/:_id',
    api.middleware.requireAdmin,
    api.comparisons.retrieve );
  app.patch( '/api/comparisons/:_id', api.comparisons.update );
  app.all( '/api/comparisons*', api.middleware.onlyAllow( 'GET', 'PATCH' ) );

  app.patch( '/api/judgements/:_id', api.judgements.update );
  app.all( '/api/judgements*', api.middleware.onlyAllow( 'PATCH' ) );

  app.post('/api/seqs', api.seqs.create);
  app.all( '/api/seqs*', api.middleware.onlyAllow( 'POST' ) );

  app.all( '/api*', api.middleware.notFound, api.middleware.handleError );

};
