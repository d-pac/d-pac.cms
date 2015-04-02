var keystone = require( 'keystone' );
var errors = require( "errors" );
var async = require( 'async' );

exports = module.exports = function( req,
                                     res,
                                     next ){
  var view = new keystone.View( req, res ),
    locals = res.locals;

  // Set locals
  locals.section = 'page';
  locals.filters = {
    page : req.params.page
  };
  locals.data = {};

  // Load the current page
  view.on( 'init', function( callback ){
    var q = keystone.list( 'Page' ).model.findOne( {
      state : 'published',
      slug  : locals.filters.page
    } ).populate( 'author' );

    q.exec( function( err,
                      result ){
      if( !result || 0 >= result.length ){
        return res.status( 404 )
          .send( keystone.wrapHTMLError( 'Sorry, no page could be found at this address (404)' ) );
      }
      locals.data.page = result;
      callback();
    } );
  } );

  // Render the view
  view.render( 'page' );
};
