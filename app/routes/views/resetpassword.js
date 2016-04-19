var keystone = require( 'keystone' );

exports = module.exports = function( req,
                                     res ){

  var infoMessage = 'If we found a corresponding user, you\'ll receive an email with instructions on how to reset your password';
  var view = new keystone.View( req, res );
  var locals = res.locals;
  locals.section = 'auth';
  locals.submitted = req.body || {};
  locals.brand = keystone.get('brand');
  locals.title = locals.brand+ ': reset password';
  locals.logo = keystone.get('signin logo');
  locals.csrf_token_key = keystone.security.csrf.TOKEN_KEY;
  locals.csrf_token_value= keystone.security.csrf.getToken(req, res);

  view.on( 'post', function( next ){
    if( !keystone.security.csrf.validate( req ) ){
      req.flash( 'error', 'There was an error with your request, please try again.' );
      return next();
    }
    if( !req.body.email ){
      req.flash( 'error', 'Please enter your email address.' );
      return next();
    }

    keystone.auth.attemptResetMail( {
      email: req.body.email,
      from: req.query.from,
      logo: keystone.get( 'signin logo' )
    }, function( err ){
      if( err ){
        req.flash( 'error', 'There was an error with your request, please try again.' );
      } else {
        req.flash( 'success', infoMessage );
      }
      return next();
    } );
  } );

  view.render( 'resetpassword' );
};
