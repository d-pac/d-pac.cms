'use strict';

var keystone = require( "keystone" );

exports = module.exports = function( req,
                                     res ){
  var locals = res.locals;
  var view = new keystone.View( req, res );

  // Set locals
  locals.section = "home";
  locals.data = {};

  // Load the current page
  view.on( 'init', function( next ){

    var q = keystone.list( 'Page' ).model.findOne( {
      slug: 'homepage'
    } );

    q.exec( function( err,
                      result ){
      locals.data.page = result;
      next( err );
    } );
  } );

  // Render the view
  view.render( "index" );
};
