var keystone = require( "keystone" );

exports = module.exports = function( req,
                                     res ){
  var locals = res.locals;
  var view = new keystone.View( req, res );

  // Set locals
  locals.section = "home";

  // Render the view
  view.render( "index" );
};
