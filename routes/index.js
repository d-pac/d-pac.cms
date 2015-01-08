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

  //TOdo: this is just a temporary fix until https://github.com/keystonejs/keystone/issues/663 is solved
  //keystone.set( '500', function( err,
  //                               req,
  //                               res,
  //                               next ){
  //  res.send( 400, new errors.Http400Error( {
  //    explanation : "Malformed JSON"
  //  } ) );
  //} );

  // Views
  app.get( '/', routes.views.index );
  app.get( '/blog/:category?', routes.views.blog );
  app.get( '/blog/post/:post', routes.views.post );
  app.all( '/contact', routes.views.contact );


  // # REST API
  var api = routes.api;

  /**
   * @apiDefine Anonymous Anonymous
   *    Requests are allowed for all users.
   */

  /**
   * @apiDefine Authenticated Authenticated
   *    Requests are only allowed for authenticated users, i.e. logged in,
   *    and restricted to that user.
   */

  /**
   * @apiDefine Admin Admin
   *    Requests are only allowed for administrative users, i.e. with special rights.
   */

  /**
   * @apiDefine AuthParams
   * @apiParam {String} email E-mail address
   * @apiParam {String} password Password
   * @apiParam {String} password_confirm Password confirmation
   */

  /**
   * @apiDefine HttpError Error
   *    An Error occurred
   * @apiError (Failure Response: Error) {String} code    HTTP Status code.
   * @apiError (Failure Response: Error) {String} status  HTTP Status code.
   * @apiError (Failure Response: Error) {String} name    Error name.
   * @apiError (Failure Response: Error) {String} message What went wrong.
   * @apiError (Failure Response: Error) {Object} explanation How to solve it.
   */

  /**
   * @apiDefine Error400Example
   * @apiErrorExample {json} Failure Response Example: 400 Bad Request
   *  HTTP/1.1 400 Bad Request
   *  {
   *    "code": "400",
   *    "status": "400",
   *    "name": "Http400Error",
   *    "message": "Bad Request",
   *    "explanation": "Missing parameters: 'assessment'"
   *  }
   */

  /**
   * @apiDefine Error401Example
   * @apiErrorExample {json} Failure Response Example: 401 Unauthorized
   *  HTTP/1.1 401 Unauthorized
   *  {
   *    "code": "401",
   *    "status": "401",
   *    "name": "Http401Error",
   *    "message": "Unauthorized",
   *    "explanation": "You need to be logged in."
   *  }
   */

  /**
   * @apiDefine Error422Example
   * @apiErrorExample {json} Failure Response Example: 422 Unprocessable Entity
   *  HTTP/1.1 422 Unprocessable Entity
   *  {
   *    "code": "422",
   *    "status": "422",
   *    "name": "Http422Error",
   *    "message": "Validation failed",
   *    "explanation": [
   *      "Passwords must match"
   *    ]
   *  }
   */

  /**
   * @apiDefine SuccessReturnsUser
   * @apiSuccess (Success Response: User) {String} _id          User id
   * @apiSuccess (Success Response: User) {String} email       E-mail address
   * @apiSuccess (Success Response: User) {Object} name
   * @apiSuccess (Success Response: User) {String} name.first  First name
   * @apiSuccess (Success Response: User) {String} name.last   Last name
   * @apiSuccessExample {json} Success Response Example
       HTTP/1.1 200 OK
       {
         "_id": "53a984cca87b4b7d57a99858",
         "email": "john.doe@example.com",
         "name": {
           "first": "John",
           "last": "Doe"
         }
       }
   */

  /**
   * @apiDefine SuccessReturnsEmpty
   * @apiSuccess (Success Response: (No Content)) N/A Response is empty
   * @apiSuccessExample Success Response Example: No Content
       HTTP/1.1 204 No Content
   */

  /**
   * @apiDefine SuccessReturnsAssessmentsList
   * @apiSuccess (Success Response: Assessment[]) {Object[]} assessments List of assessments
   * @apiSuccessExample {json} Success Response Example
       HTTP/1.1 200 OK
       [
          {
             "_id": "5458894f0138e02976448d26",
             "title": "Schrijfopdracht 1: Kinderen",
             "description": "<p>Lorem ipsum</p>",
             "order": 10,
             "state": "published",
             "comparisonsNum": 23,
             "phases": [
                 "5423f87677177065a0887b99",
                 "5423f87677177065a0887b9a",
                 "5423f87677177065a0887b9b",
                 "5423f87677177065a0887b9c",
                 "5423f87677177065a0887b9d",
                 "5423f87677177065a0887b9e"
             ]
         }
       ]
   */

  /**
   * @apiDefine SuccessReturnsComparison
   * @apiSuccess (Success Response: Comparison) {String} _id Comparison id
   * @apiSuccess (Success Response: Comparison) {Number} _rid Human-friendly unique id
   * @apiSuccess (Success Response: Comparison) {String} assessor User id
   * @apiSuccess (Success Response: Comparison) {String} assessment Assessment id
   * @apiSuccess (Success Response: Comparison) {String} phase Phase id
   * @apiSuccess (Success Response: Comparison) {Boolean} completed Whether the comparison is completely finished, i.e. all phases have be iterated.
   * @apiSuccess (Success Response: Comparison) {String} selected Representation id
   * @apiSuccess (Success Response: Comparison) {String} comparativeFeedback Comparative feedback provided by the assessor.
   * @apiSuccessExample {json} Success Response Example
   {
       "_id": "54635da80b7ce8bc0ba66382",
       "_rid": 36,
       "assessor": "545892d20138e02976448d39",
       "assessment": "5458894f0138e02976448d26",
       "phase": "5423f87677177065a0887b9e",
       "completed": true,
       "selected": "545b261a7b0463af66064169",
       "comparativeFeedback": "Lorem ipsum"
   }
   */

  //ALL /api
  app.all( '/api*',
    middleware.reflectReq,
    api.middleware.initAPI,
    api.middleware.initCORS() );

  /**
   * @api {post} /me/session Create
   * @apiVersion 0.1.0
   * @apiGroup Session
   * @apiName createSession
   * @apiDescription (Re-)creates a session, i.e. signin.
   * @apiPermission Anonymous
   * @apiUse AuthParams
   * @apiUse SuccessReturnsUser
   */
  app.post( '/api/me/session',
    //todo: shouldn't password_confirm be added?
    api.middleware.requireParams( "email", "password" ),
    api.sessions.create );
  /**
   * @api {get} /me/session Retrieve
   * @apiVersion 0.1.0
   * @apiGroup Session
   * @apiName retrieveSession
   * @apiDescription Retrieve session for logged in user
   * @apiPermission Authenticated
   * @apiUse SuccessReturnsUser
   */
  app.get( '/api/me/session', api.sessions.retrieve );

  app.all( '/api*',
    api.middleware.requireUser );

  /**
   * @api {delete} /me/session Destroy
   * @apiVersion 0.1.0
   * @apiGroup Session
   * @apiName DestroySession
   * @apiDescription Destroys the session for the logged in user, i.e. signout.
   * @apiPermission Authenticated
   * @apiUse SuccessReturnsEmpty
   */
  app.delete( '/api/me/session*', api.sessions.destroy );
  app.all( '/api/me/session*', api.middleware.onlyAllow( 'GET, POST, DELETE' ) );

  /**
   * @api {get} /me/account Retrieve
   * @apiVersion 0.1.0
   * @apiGroup Account
   * @apiName RetrieveAccount
   * @apiDescription Retrieves the account details for the current user.
   * @apiPermission Authenticated
   * @apiUse SuccessReturnsUser
   */
  app.get( '/api/me/account', api.users.retrieve );

  app.put( '/api/me/account',
    api.middleware.requireParams( User.api.editable ),
    api.users.replace );

  /**
   * @api {patch} /me/account Update
   * @apiVersion 0.1.0
   * @apiGroup Account
   * @apiName UpdateAccount
   * @apiDescription Updates the account details for the current user.
   * @apiPermission Authenticated
   * @apiUse AuthParams
   * @apiUse SuccessReturnsUser
   */
  app.patch( '/api/me/account', api.users.update );
  app.all( '/api/me/account*', api.middleware.onlyAllow( 'GET, PATCH, PUT' ) );

  /**
   * @api {get} /me/mementos List
   * @apiVersion 0.1.0
   * @apiGroup Mementos
   * @apiName ListMementos
   * @apiDescription Retrieves a list of the active mementos for the current user.
   * @apiPermission Authenticated
   * todo: return object
   */
  app.get( '/api/me/mementos', api.me.listMementos );

  /**
   * @api {post} /me/mementos Create
   * @apiVersion 0.1.0
   * @apiGroup Mementos
   * @apiName CreateMementos
   * @apiDescription Creates a memento for a specific assessment and the current user.
   * @apiPermission Authenticated
   * @apiParam {String} Assessment Assessment Identifier
   * todo: return object
   */
  app.post( '/api/me/mementos',
    api.middleware.requireParams( "assessment" ),
    api.me.createMemento );
  app.all( '/api/me/mementos*', api.middleware.onlyAllow( 'GET, POST' ) );

  /**
   * @api {get} /me/assessments List
   * @apiVersion 0.1.0
   * @apiGroup Assessments
   * @apiName ListAssessments
   * @apiDescription Retrieves a list of the assessments the current user is registered as an assessor for.
   * @apiPermission Authenticated
   * @apiUse SuccessReturnsAssessmentsList
   */
  app.get( '/api/me/assessments', api.me.listAssessments );
  app.all( '/api/me/assessments*', api.middleware.onlyAllow( 'GET' ) );


  /**
   * @api {get} /comparisons/:id Retrieve
   * @apiVersion 0.1.0
   * @apiGroup Comparisons
   * @apiName RetrieveComparison
   * @apiDescription Retrieves the comparison with the given id.
   * @apiPermission Admin
   * @apiUse SuccessReturnsComparison
   */
  app.get( '/api/comparisons/:_id',
    api.middleware.requireAdmin,
    api.comparisons.retrieve );


  /**
   * @api {patch} /comparisons/:id Update
   * @apiVersion 0.1.0
   * @apiGroup Comparisons
   * @apiName UpdateComparison
   * @apiDescription Updates the comparison with the given id.
   * @apiPermission Authenticated
   * @apiParam {String} phase Phase id
   * @apiParam {Boolean} completed Whether the comparison is completed
   * @apiParam {String} comparativeFeedback Comparative feedback provided by the assessor.
   * @apiUse SuccessReturnsComparison
   */
  app.patch( '/api/comparisons/:_id', api.comparisons.update );
  app.put( '/api/comparisons/:_id', api.comparisons.update );

  app.all( '/api/comparisons*', api.middleware.onlyAllow( 'GET', 'PATCH', 'PUT' ) );

  app.put( '/api/judgements/:_id', api.judgements.update );
  app.patch( '/api/judgements/:_id', api.judgements.update );
  app.all( '/api/judgements*', api.middleware.onlyAllow( 'PATCH' ) );

  app.post( '/api/seqs', api.seqs.create );
  app.patch( '/api/seqs/:_id', api.seqs.update );
  app.put( '/api/seqs/:_id', api.seqs.update );
  app.all( '/api/seqs*', api.middleware.onlyAllow( 'POST' ) );

  app.get( '/api/timelogs', api.timelogs.list );
  app.post( '/api/timelogs', api.timelogs.create );
  app.patch( '/api/timelogs/:_id', api.timelogs.update );
  app.put( '/api/timelogs/:_id', api.timelogs.update );
  app.all( '/api/timelogs*', api.middleware.onlyAllow( 'GET', 'POST', 'PATCH', 'PUT' ) );

  //app.get('/api/representations/next', api.representations.retrievePair,
  //    api.middleware.notFound,
  //    api.middleware.handleError);

  app.get( '/api/reports/comparisons', api.middleware.requireAdmin, api.reports.comparisons);

  app.all('/api/admin*', api.middleware.requireAdmin);

  app.get('/api/admin/representations/actions/duplicates', api.admin.duplicateRepresentations);
  app.get('/api/admin/representations/actions/next', api.representations.retrievePair);

  app.all( '/api*', api.middleware.notFound, api.middleware.handleError );

  app.get( '/representations/:_id.:format',
    api.middleware.initAPI,
    api.middleware.initCORS(),
    api.representations.retrieveFile,
    api.middleware.notFound,
    api.middleware.handleError );

};
