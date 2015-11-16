// Simulate config options from your production environment by
// customising the .env file in your project's root folder.

var _ = require( 'lodash' );
var grappling = require( 'grappling-hook' );

var konfy = require( "konfy" );
konfy.load();

// Require keystone
var keystone = require( "keystone" );
keystone.importer( __dirname )( "patches" );

var errors = require( "errors" );

var nodeEnv = process.env.NODE_ENV || "development";

if( "development" === nodeEnv ){
  errors.stacks( true );
}

keystone.hooks = grappling.create( { strict: false } );

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

var pkg = require( "../package.json" );
keystone.init( {

  "name": "d-pac",
  "brand": "d-pac",
  "appversion": pkg.version + " (" + pkg.build + ")",

  "mongo uri": process.env.MONGO_URI,
  "less": "public",
  "static": "public",
  "favicon": "public/favicon.ico",

  "logger": process.env.LOGGER || "dev",

  "views": "templates/views",
  "view engine": "jade",

  "auto update": true,

  "session": true,
  "session store": "connect-mongo",
  "session store options": {
    url: process.env.MONGO_SESSIONS_URI
  },
  "auth": true,
  "user model": "User",
  "cookie secret": process.env.COOKIE_SECRET,
  "api root": "/api",
  mongoose: require( 'mongoose' ),
  'emails': 'templates/emails'
} );

console.log( '------------------------------------------------' );
console.log( 'Environment:', nodeEnv );
console.log( 'Node', process.version, '-', 'Keystone', keystone.version, '-', keystone.get( 'name' ), keystone.get( 'appversion' ) );

require( './lib/pluginsScrobbler' ).init( pkg );

// Load your project's Models

keystone.import( "models" );

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set( "locals", {
  _: require( "lodash" ),
  env: keystone.get( "env" ),
  utils: keystone.utils,
  editable: keystone.content.editable
} );

// Load your project's Routes

keystone.set( "routes", require( "./routes" ) );

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.

// Configure the navigation bar in Keystone's Admin UI

keystone.set( "nav", {
  "content": [
    "pages",
    "posts",
    "post-categories",
    "enquiries"
  ],
  "data": [
    "phases",
    "assessments",
    "representations",
    "documents",
    "comparisons",
    "organizations",
    "users",
    "notes",
    "timelogs"
  ],
  "misc": [
    "reports",
    "bulkuploads",
    "actions",
    "messages"
  ]
} );

_.each( keystone.import( 'hooks' ), function( handler ){
  handler.init();
} );
module.exports = keystone;

if( !module.parent ){
  // Start Keystone to connect to your database and initialise the web server
  keystone.start();
}
