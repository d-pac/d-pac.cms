'use strict';

// Simulate config options from your production environment by
// customising the .env file in your project's root folder.

const mongoose = require( 'mongoose' );
mongoose.Promise = require( 'bluebird' );

const _ = require( 'lodash' );
const grappling = require( 'grappling-hook' );

const konfy = require( "konfy" );
konfy.load();

// Require keystone
const keystone = require( "keystone" );
keystone.importer( __dirname )( "patches" );

const errors = require( "errors" );

const getSafeBoolean = require('./lib/getSafeBoolean');

const nodeEnv = process.env.NODE_ENV || "development";

keystone.hooks = grappling.create( { strict: false } );

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.
const env = process.env;
const pkg = require( "../package.json" );
const appversion = process.env.APP_VERSION_LABEL || pkg.version;

keystone.auth = require( './lib/auth' );

const clientUrl = env.CLIENT_URL || env.ROOT_URL + '/tool';
keystone.init( {

  "name": "d-pac",
  "brand": "d-pac",
  "appversion": appversion,

  "root url": env.ROOT_URL,
  "mongo uri": env.MONGO_URI,
  "client url": clientUrl,
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
      : clientUrl );
  },
  "signout url": "/auth/signout",
  "resetpassword url": "/auth/resetpassword",
  "changepassword url": "/auth/changepassword",
  "changepassword redirect": clientUrl,

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
  "dev env": (env.NODE_ENV !== "production"),
  "user directory": process.env.DIR_USER || "app/uploads",
  "feature disable passwordresets": getSafeBoolean(process.env.FEATURE_DISABLE_PASSWORDRESETS),
  "feature enable anonymous": getSafeBoolean(process.env.FEATURE_ENABLE_ANONYMOUS),
} );


if( keystone.get( 'dev env' ) ){
  process.on( 'unhandledRejection', ( reason ) =>{
    console.log( 'Unhandle Promise Rejection: ' + reason );
  } );
}
if( keystone.get( 'dev env' ) ){
  errors.stacks( true );
}


keystone.set( 'email locals', {
  utils: keystone.utils,
  host: keystone.get( 'root url' ),
  logo_src: keystone.get( 'root url' ) + keystone.get( "signin logo" )
} );

if( process.env.DPAC_ADMIN_COLOR ){
  keystone.set( 'admin ui styles', `background-color: ${process.env.DPAC_ADMIN_COLOR};` );
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
  "setup":[
    "assessments",
    "users",
    "bulkusers",
    "documents",
    "representations",
    "bulkrepresentations",
    "actions",
    "messages",
  ],
  "data": [
    "reports",
    "comparisons",
    "notes",
    "feedback",
    "timelogs",
    "phases",
    "organizations",
  ],
  "misc": [
    "pages",
    "posts",
    "post-categories",
    "enquiries"
  ]
} );

_.forEach( keystone.import( 'hooks' ), function( handler ){
  if( handler.init ){
    handler.init();
  }
} );

module.exports = keystone;

if( !module.parent ){
  // Start Keystone to connect to your database and initialise the web server
  keystone.start( {
    onMount: ()=>{
      keystone.auth.init();
    },
    onStart: ()=>{
      console.log( '---Started---' );
    }
  } );
}
