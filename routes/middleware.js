/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */

var _ = require( 'underscore' ),
  querystring = require( 'querystring' ),
  keystone = require( 'keystone' );

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
    { label : 'Home', key : 'home', href : '/' },
    { label : 'Blog', key : 'blog', href : '/blog' },
    { label : 'Contact', key : 'contact', href : '/contact' }
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
    info    : req.flash( 'info' ),
    success : req.flash( 'success' ),
    warning : req.flash( 'warning' ),
    error   : req.flash( 'error' )
  };

  res.locals.messages = _.any( flashMessages, function( msgs ){
    return msgs.length;
  } )
    ? flashMessages
    : false;

  next();

};

/**
 Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function( req,
                                res,
                                next ){
  console.log( 'middleware.requireUser' );
  if( !req.user ){
    res.format( {
      'text/html'        : function(){
        req.flash( 'error', 'Please sign in to access this page.' );
        res.redirect( '/keystone/signin' );
      },
      'application/json' : function(){
        res.send( 401, {
          message : "Not allowed",
          status  : 401
        } );
      }
    } );
  }else{
    next();
  }
};

exports.parseMe = function( req,
                            res,
                            next ){
  console.log( 'middleware.parseMe', req.params.id );

  if( 'undefined' !== typeof req.params.id && req.params.id === 'me' ){
    res.locals.id = req.user.id;
  }
  next();
};

exports.requireSelf = function( req,
                                res,
                                next ){
  var id = res.locals.id || req.params.id;
  if( id && id === req.user.id ){
    next();
  }else{
    res.send( 401, {
      message : "Not allowed",
      status  : 401
    } );
  }
};
