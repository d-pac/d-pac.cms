'use strict';

/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project"s /lib directory.
 */

var _ = require( "lodash" );
var debug = require( "debug" )( "dpac:middleware" );
/**
 Initialises the standard view locals

 The included layout depends on the navLinks array to generate
 the navigation in the header, you may wish to change this array
 or replace it with your own templates / logic.
 */

exports.initLocals = function( req,
                               res,
                               next ){
  var locals = res.locals;

  locals.navLinks = [
    {
      label : "Home",
      key   : "home",
      href  : "/"
    },
    {
      label : "Contact",
      key   : "contact",
      href  : "/contact"
    }
  ];

  locals.user = req.user;

  next();
};

/**
 Fetches and clears the flashMessages before a view is rendered
 */

exports.flashMessages = function( req,
                                  res,
                                  next ){
  var flashMessages = {
    info    : req.flash( "info" ),
    success : req.flash( "success" ),
    warning : req.flash( "warning" ),
    error   : req.flash( "error" )
  };

  res.locals.messages = _.some( flashMessages, function( msgs ){
    return msgs.length;
  } )
    ? flashMessages
    : false;

  next();
};

exports.reflectReq = function( req,
                               res,
                               next ){
  debug( "REQUEST: >>>>>>>>>>>>>>>>>>>>>> ", req.method, req.url );
  debug( "\n", {
    METHOD  : req.method,
    HEADERS : req.headers,
    QUERY   : req.query,
    BODY    : req.body
  } );
  next();
};

exports.disableCache = (req, res, next) =>{
  res.header("Expires", "-1");
  res.header("Cache-Control", "no-cache, no-store, private");
  next();
};
