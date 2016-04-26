// Simulate config options from your production environment by
// customising the .env file in your project's root folder.

var mongoose = require( 'mongoose' );
mongoose.Promise = require( 'bluebird' );

var _ = require( 'lodash' );
var grappling = require( 'grappling-hook' );

var konfy = require( "konfy" );
konfy.load();

// Require keystone
var keystone = require( "keystone" );
keystone.importer( __dirname )( "patches" );

var errors = require( "errors" );

var nodeEnv = process.env.NODE_ENV || "development";

keystone.hooks = grappling.create( { strict: false } );

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.
var env = process.env;
var pkg = require( "../package.json" );
var appversion = (process.env.APP_VERSION_LABEL)
  ? pkg.version + "-" + process.env.APP_VERSION_LABEL
  : pkg.version;

keystone.auth = require( './lib/auth' );

keystone.init( {

  "name": "d-pac",
  "brand": "d-pac",
  "appversion": appversion,

  "root url": env.ROOT_URL,
  "mongo uri": env.MONGO_URI,
  "less": "public",
  "static": "public",
  "favicon": "public/favicon.ico",
  "signin logo": "/images/d-pac-logo_colour.png",
  "signin url": "/auth/signin",
  "signin redirect": function( user,
                               req,
                               res ){
    res.redirect( (user.canAccessKeystone)
      ? "/keystone"
      : "/tool" );
  },
  "signout url": "/auth/signout",
  "resetpassword url": "/auth/resetpassword",
  "changepassword url": "/auth/changepassword",
  "changepassword redirect": "/tool",

  "logger": env.LOGGER || "dev",

  "views": "templates/views",
  "view engine": "jade",

  "auto update": true,

  "session": true,
  "session store": "connect-mongo",
  "session store options": {
    url: env.MONGO_SESSIONS_URI
  },
  "auth": true,
  "user model": "User",
  "cookie secret": env.COOKIE_SECRET,
  "api root": "/api",
  "mongoose": mongoose,
  'emails': 'templates/emails',
  "mail admin": {
    name: "d-pac administrator",
    email: env.MAIL_ADMIN || 'info@d-pac.be'
  },
  "mail noreply": {
    name: "automated d-pac mailer",
    email: "no-reply@d-pac.be"
  },
  "api disable": env.API_DISABLE || '',
  "dev env": ( typeof env.DEV_ENV !== "undefined" )
    ? ( env.DEV_ENV === "true" )
    : ("development" === nodeEnv)
} );

if( keystone.get( 'dev env' ) ){
  process.on( 'unhandledRejection', ( reason ) =>{
    console.log( 'Unhandle Promise Rejection: ' + reason );
  } );
}

keystone.set( 'email locals', {
  utils: keystone.utils,
  host: keystone.get( 'root url' ),
  logo_src: keystone.get( 'root url' ) + keystone.get( "signin logo" )
} );

if( process.env.DPAC_ADMIN_COLOR ){
  keystone.set( 'admin ui styles', `background-color: ${process.env.DPAC_ADMIN_COLOR};` )
}

if( keystone.get( 'dev env' ) ){
  errors.stacks( true );
}

keystone.isDisabled = function( op ){
  return this.get( 'api disable' ).indexOf( op ) > -1;
};

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
    "feedback",
    "timelogs"
  ],
  "misc": [
    "reports",
    "bulkuploads",
    "actions",
    "messages"
  ]
} );

_.forEach( keystone.import( 'hooks' ), function( handler ){
  handler.init && handler.init();
} );

module.exports = keystone;

if( !module.parent ){
  // Start Keystone to connect to your database and initialise the web server
  keystone.start( {
    onMount: ()=>{
      keystone.auth.init();
    },
    onStart: ()=>{
      const k = keystone;
      console.log( '---Started---' );
    }
  } );
}
