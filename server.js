// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require( 'dotenv' ).load();

// Require keystone
var express = require('express'),
    mongoose = require('mongoose'),
    app = express(),
    keystone = require('keystone').connect(mongoose, app);

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

app.use('/uploads', require('./routes/api/middleware' ).initCORS());

keystone.init( {

  'name'  : 'd-pac',
  'brand' : 'd-pac',

  'less'    : 'public',
  'static'  : 'public',
  'favicon' : 'public/favicon.ico',

  'logger' : process.env.LOGGER || 'dev',

  'views'       : 'templates/views',
  'view engine' : 'jade',

  'auto update' : true,

  'session'       : true,
  'session store' : 'mongo',
  'auth'          : true,
  'user model'    : 'User',
  'cookie secret' : 'mSxJb5Xr6cz;T%($q%iLg[w_V/|(*}PhgCt(;!IbqH#{;yL@41f5@T-}p%>/[HhO'

} );



// Load your project's Models

keystone.import( 'models' );


// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set( 'locals', {
  _        : require( 'underscore' ),
  env      : keystone.get( 'env' ),
  utils    : keystone.utils,
  editable : keystone.content.editable
} );

// Load your project's Routes

keystone.set( 'routes', require( './routes' ) );

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.

// Configure the navigation bar in Keystone's Admin UI

keystone.set( 'nav', {
  'content'     : [
    'posts',
    'post-categories',
    'enquiries'
  ],
  'assessments' : [
    'assessments',
    'representations',
    'comparisons',
    'judgements',
    'timelogs'
  ],
  'users'       : [
    'users',
    'personas',
    'organizations'
  ]
} );

// Start Keystone to connect to your database and initialise the web server
keystone.start();
