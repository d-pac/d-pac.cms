'use strict';

const keystone = require( 'keystone' );
const async = require( 'async' );
const moment = require( 'moment' );

const utils = require( 'keystone-utils' );
const createToken = require('./createToken');

exports.init = function(){
  const mongoose = keystone.mongoose;
  const Reset = new mongoose.Schema( {
    token: {
      type: String,
      index: true
    },
    nonce: { type: String },
    expires: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }, { collection: keystone.prefixModel( 'App_Auth' ) } );
  mongoose.model( 'App_Auth', Reset );
};

/**
 * Checks if a user with the given the lookup email exists in the database
 *
 * @param {Object} lookup - must contain email
 * @param {function()} onSuccess callback, is passed the User instance
 * @param {function()} onFail callback
 */

exports.attemptResetMail = function( lookup,
                                     next ){
  const User = keystone.list( keystone.get( 'user model' ) );
  if( 'string' === typeof lookup.email ){
    // match email address
    const emailRegExp = new RegExp('^' + utils.escapeRegExp(lookup.email) + '$', 'i');
    User.model.findOne( { email: emailRegExp } ).exec( function( err,
                                                                  user ){
      if( err ){
        return next( err );
      }
      if( user && user.sendResetPassword ){
        return user.sendResetPassword( next );
      }
      next();
    } );
  } else {
    next( new Error( 'e-mail must be string' ) );
  }
};

exports.verifyResetToken = function( token,
                                     nonce,
                                     req,
                                     res,
                                     next ){
  async.waterfall( [
    function( callback ){
      const mongoose = keystone.mongoose,
        Reset = mongoose.model( 'App_Auth' );
      Reset.findOne( { token: token } ).exec( function( err,
                                                        reset ){
        callback( err, reset );
      } );
    },
    function( reset,
              callback ){
      if( reset ){
        if( !reset.expires || !reset.nonce ){
          return callback( new TypeError( "Invalid reset data" ) );
        }
        if( moment().diff( reset.expires ) >= 0 ){
          return callback( new Error( "Reset token expired" ) );
        }
        if( nonce ){
          if( !reset.verified ){
            return callback( new Error( "Invalid reset data" ) );
          }
          if( nonce !== reset.nonce ){
            return callback( new Error( "Nonce does not match" ) );
          }
          reset.remove( function( err ){
            callback( err, reset );
          } );
        } else {
          if( reset.verified ){
            return callback( new Error( "Cannot reuse token" ) );
          }
          reset.verified = true;
          reset.save( function( err ){
            callback( err, reset );
          } );
        }
      } else {
        callback( new Error( 'Reset token invalid' ) );
      }
    },
    function( reset,
              callback ){
      const User = keystone.list( keystone.get( 'user model' ) );
      User.model.findById( reset.id, function( err,
                                               user ){
        callback( err, {
          user: user,
          reset: reset
        } );
      } );
    }
  ], next );
};

exports.sendResetPassword = function( callback ){

  const expires = moment().add( 7, 'days' );
  const token = createToken();
  const nonce = createToken();
  const user = this;
  const Reset = keystone.mongoose.model( 'App_Auth' );
  const data = {
    token: token,
    expires: expires,
    nonce: nonce,
    verified: false
  };

  Reset.update( { _id: user.id }, data, { upsert: true }, function( err ){

    if( err ){
      return callback( err );
    }

    return new keystone.Email( {
      templateName: 'reset-password'
    } ).send( {
      to: user.email,
      from: keystone.get( "mail admin" ),
      subject: 'Reset your password',
      reset: {
        token: token,
        expires: expires,
        url: keystone.get( 'changepassword url' ) + '/' + encodeURIComponent( token )
      },
      first_name: user.name.first,
    }, ( err,
         data )=>{
      if( err ){
        console.log( err );
      }
      callback( err, data );
    } );
  } );
};

exports.sendInvite = function( from,
                               callback ){
from = from || keystone.get( "mail admin" );
  const expires = moment().add( 1, 'month' );
  const token = createToken();
  const nonce = createToken();
  const user = this;
  const Invite = keystone.mongoose.model( 'App_Auth' );
  const data = {
    token: token,
    expires: expires,
    nonce: nonce,
    verified: false
  };

  Invite.update( { _id: user.id }, data, { upsert: true }, function( err ){

    if( err ){
      return callback( err );
    }

    return new keystone.Email( {
      templateName: 'invite-user'
    } ).send( {
      to: user.email,
      from: from,
      subject: `${from.name} invited you to participate in d-pac`,
      invite: {
        token: token,
        expires: expires,
        url: keystone.get( 'changepassword url' ) + '/' + encodeURIComponent( token )
      },
      user: user
    }, ( err,
         data )=>{
      if( err ){
        console.log( err );
      }
      callback( err, data );
    } );
  } );
};
