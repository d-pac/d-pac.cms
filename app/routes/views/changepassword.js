'use strict';
var keystone = require( 'keystone' );

module.exports = function( req,
                           res ){
  const view = new keystone.View( req, res );

  var locals = res.locals;
  locals.section = 'auth';
  locals.submitted = req.body || {};
  locals.brand = keystone.get( 'brand' );
  locals.title = locals.brand + ': change password';
  locals.logo = keystone.get( 'signin logo' );
  locals.csrf_token_key = keystone.security.csrf.TOKEN_KEY;
  locals.csrf_token_value = keystone.security.csrf.getToken( req, res );

  view.on( 'post', function( next ){
    if( !keystone.security.csrf.validate( req ) ){
      req.flash( 'error', 'There was an error with your request, please try again.' );
      return res.redirect( keystone.get( 'signin url' ) );
    }

    if( !req.body.password || !req.body.password_confirm ){
      req.flash( 'error', 'Please enter a new password and confirmation' );
      return next();
    }

    if( !req.body.nonce ){
      req.flash( 'error', 'Invalid request' );
      return res.redirect( keystone.get( 'signin url' ) );
    }

    keystone.auth.verifyResetToken( req.params.token, req.body.nonce, req, res, function( err,
                                                                                          data ){
      if( err ){
        req.flash( 'error', err );
        return res.redirect( keystone.get( 'signin url' ) );
      }
      data.user.getUpdateHandler( req ).process( req.body, {
        fields: [ 'password' ],
        flashErrors: true
      }, function( err,
                   user ){
        if( err ){
          if( err.name !== 'ValidationError' ){
            req.flash( 'error', 'Could not update password' );
          }
          return res.redirect( keystone.get( 'signin url' ) );
        } else {
          keystone.session.signinWithUser( user, req, res, function( user ){
            req.flash( 'success', 'Password changed successfully' );
            res.redirect( keystone.get( 'changepassword redirect' ) || '/keystone' );
          } );
        }
      } );
    } );
  } );

  view.on( 'get', function( next ){
    keystone.auth.verifyResetToken( req.params.token, null, req, res, function( err,
                                                                                data ){
      if( err ){
        console.log(err);
        req.flash( 'error', 'Password reset not allowed, maybe the link has expired?' );
        return res.redirect( keystone.get( 'resetpassword url' ) );
      }
      locals.user = data.user;
      locals.reset = data.reset;
      next();
    } );
  } );
  view.render( 'changepassword', locals );
};
