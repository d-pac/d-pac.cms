'use strict';

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

const keystone = require("keystone");
const path = require('path');
const appMw = require("./middleware");
const importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre("routes", appMw.initLocals);
keystone.pre("render", appMw.flashMessages);

// Import Route Controllers
const routes = {
  views: importRoutes("./views"),
  api: importRoutes("./api")
};
const api = routes.api;
const apiMw = api.helpers.middleware;
const registerDefaultRoutes = api.helpers.registerDefaultRoutes;
const initCORS = apiMw.createCors();

// Setup Route Bindings
exports = module.exports = function (app) {
  const apiRoot = keystone.get("api root");

  app.use(initCORS);

  app.use('/reports',
    apiMw.requireUser, apiMw.requireAdmin,
    keystone.express.static(path.resolve(keystone.get("user directory"), "./reports")));

  // Views
  app.get("/", routes.views.index);
  //app.get( "/blog/:category?", routes.views.blog );
  //app.get( "/blog/post/:post", routes.views.post );
  app.get('/content/:page', routes.views.page);
  app.all("/contact", routes.views.contact);

  app.all(keystone.get('signin url'), routes.views.signin);
  app.all(keystone.get('signout url'), routes.views.signout);
  app.all(keystone.get('resetpassword url'), routes.views.resetpassword);
  app.all(keystone.get('changepassword url') + '/:token', routes.views.changepassword);

  // # REST API
  app.route("/media/R:rid.:ext")
    .get(apiMw.initAPI,
      api.documents.retrieveMedia);


  // -- API setup --
  app.route(apiRoot + "*")
    .all(appMw.reflectReq)
    .all(appMw.disableCache)
    .all(apiMw.initAPI)
  ;

  app.route(apiRoot + "/system/:action")
    .all(apiMw.setType('ping', 'single'))
    .get(api.system.action);

  app.route(apiRoot + "/session")
    .all(apiMw.setType('sessions', 'single'))
    .get(api.authentication.status,
      api.users.includeUser)
    .post(api.authentication.signin,
      api.users.includeUser)
    .delete(apiMw.requireUser,
      api.authentication.signout);

  app.route(apiRoot + "/user")
    .all(apiMw.setType('users', 'single'))
    .all(apiMw.requireUser)
    .all(apiMw.setIdParamToUser)
    .get(api.users.retrieve)
    .patch(api.users.update);

  app.route(apiRoot + "/user/assessments")
    .all(apiMw.setType('assessments', 'multiple'))
    .all(apiMw.requireUser)
    .all(apiMw.setIdParamToUser)
    .get(api.users.listAssessments);

  app.route(apiRoot + "/user/comparisons")
    .all(apiMw.setType('comparisons', 'multiple'))
    .all(apiMw.requireUser)
    .all(apiMw.setIdParamToUser)
    .get(api.users.listIncompleteComparisons,
      api.comparisons.includeRepresentations,
      api.users.includeNotes,
      api.feedback.includeFeedback
    );

  app.route(apiRoot + "/user/notes")
    .all(apiMw.setType('notes', 'multiple'))
    .all(apiMw.requireUser)
    .all(apiMw.setIdParamToUser)
    .get(api.users.listNotes);

  app.route(apiRoot + "/user/representations")
    .all(apiMw.setType('representations', 'multiple'))
    .all(apiMw.requireUser)
    .all(apiMw.setIdParamToUser)
    .get(api.users.listRepresentations);

  app.route(apiRoot + "/stats/:assessmentId")
    .all(apiMw.setType('stats', 'single'))
    .all(apiMw.requireUser)
    .get(api.stats.retrieve);

  app.route(apiRoot + "/phases")
    .all(apiMw.setType('phases', 'multiple'))
    .all(apiMw.requireUser)
    .get(api.phases.list);

  app.route(apiRoot + "/pages")
    .all(apiMw.setType('pages', 'multiple'))
    .get(api.pages.list);
  app.route(apiRoot + "/pages/:slug")
    .all(apiMw.setType('pages', 'multiple'))
    .get(api.pages.retrieve);

  app.route(apiRoot + "/representations")
    .all(apiMw.requireUser)
    .get(apiMw.setType('representations', 'multiple'))
    .get(api.representations.list)
    .post(apiMw.setType('representations', 'single'))
    .post(api.representations.create);
  app.route(apiRoot + "/representations/:_id")
    .all(apiMw.setType('representations', 'single'))
    .all(apiMw.requireUser)
    .get(api.representations.retrieve)
    .patch(api.representations.update);
  app.route(apiRoot + "/representations/:representation/feedback")
    .all(apiMw.setType('feedback', 'multiple'))
    .all(apiMw.requireUser)
    .get(api.feedback.listByRepresentation);

  app.route(apiRoot + "/messages")
    .all(apiMw.setType('messages', 'multiple'))
    .all(apiMw.requireUser)
    .post(api.messages.create);

  registerDefaultRoutes(apiRoot + "/assessments",
    app, {
      'pre:all': [
        apiMw.requireUser,
        apiMw.requireAdmin
      ],
      controller: api.assessments
    });

  registerDefaultRoutes(apiRoot + "/documents",
    app, {
      'pre:all': [
        apiMw.requireUser,
        apiMw.requireAdmin
      ],
      controller: api.documents
    });

  registerDefaultRoutes(apiRoot + "/users",
    app, {
      'pre:all': [
        apiMw.requireUser,
        apiMw.requireAdmin
      ],
      controller: api.users
    });

  registerDefaultRoutes(apiRoot + "/comparisons",
    app, {
      'pre:all': [
        apiMw.requireUser
      ],
      controller: api.comparisons,
      'post:create': [
        apiMw.setIdParamToUser,
        api.comparisons.includeRepresentations,
        api.users.includeNotes,
        api.feedback.includeFeedback
      ]
    });

  registerDefaultRoutes(apiRoot + "/notes",
    app, {
      'pre:all': [
        apiMw.requireUser
      ],
      controller: api.notes
    });

  registerDefaultRoutes(apiRoot + "/feedback",
    app, {
      'pre:all': [
        apiMw.requireUser
      ],
      controller: api.feedback
    });

  registerDefaultRoutes(apiRoot + "/timelogs",
    app, {
      'pre:list': [apiMw.requireUser],
      'pre:create': [apiMw.requireUser],
      'pre:retrieve': [apiMw.requireUser],
      'pre:remove': [apiMw.requireUser],
      controller: api.timelogs
    });

  registerDefaultRoutes(apiRoot + "/organizations",
    app, {
      'pre:all': [
        apiMw.requireUser,
        apiMw.requireAdmin
      ],
      controller: api.organizations
    });

  // -- API fallback --
  app.all(apiRoot + "*", apiMw.sendData);
  app.use(apiMw.handleError);
};
