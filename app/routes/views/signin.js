var keystone = require( 'keystone' );
var session = keystone.session;
var url = require( 'url' );
var User = keystone.list( keystone.get( 'user model' ) );

exports = module.exports = function( req,
                                     res ){

  var view = new keystone.View( req, res );
  var locals = res.locals;
  locals.section = 'auth';
  locals.submitted = req.body || {};
  locals.brand = keystone.get( 'brand' );
  locals.title = locals.brand + ': signin';
  locals.logo = keystone.get( 'signin logo' );
  locals.csrf_token_key = keystone.security.csrf.TOKEN_KEY;
  locals.csrf_token_value = keystone.security.csrf.getToken( req, res );
  locals.sendResetLink = (User.schema.methods.sendResetPassword)
    ? keystone.get( 'resetpassword url' )
    : false;

  view.on( 'post', function( next ){
    if( !keystone.security.csrf.validate( req ) ){
      req.flash( 'error', 'There was an error with your request, please try again.' );
      return next();
    }
    if( !req.body.email || !req.body.password ){
      req.flash( 'error', 'Please enter your email address and password.' );
      return next();
    }

    var onSuccess = function( user ){

      if( req.query.from && req.query.from.match( /^(?!http|\/\/|javascript).+/ ) ){
        var parsed = url.parse( req.query.from );
        if( parsed.host || parsed.protocol || parsed.auth ){
          res.redirect( '/keystone' );
        } else {
          res.redirect( parsed.path );
        }
      } else if( 'string' === typeof keystone.get( 'signin redirect' ) ){
        res.redirect( keystone.get( 'signin redirect' ) );
      } else if( 'function' === typeof keystone.get( 'signin redirect' ) ){
        keystone.get( 'signin redirect' )( user, req, res );
      } else {
        res.redirect( '/keystone' );
      }

    };

    var onFail = function(){
      req.flash( 'error', 'Sorry, that email and password combo are not valid.' );
      renderView();
    };

    keystone.session.signin( req.body, req, res, onSuccess, onFail );

  } );

  view.render( 'signin' );

};
