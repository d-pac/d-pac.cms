"use strict";
// var debug = require( "debug" )( "dpac:api.messages" );
var errors = require( 'errors' );

var constants = require( '../../models/helpers/constants' );
var service = require( "../../services/messages" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();

module.exports.create = function( req,
                                  res,
                                  next ){
  if( req.body.recipientType !== constants.recipientTypes.PAM.value
    || req.body.recipientType !== constants.recipientTypes.ADMIN.value ){
    req.body.recipientType = constants.recipientTypes.ADMIN.value;
  }
  req.body.strategy = 'send';
  req.body.createdBy = req.user.id;
  req.body.confirm = true;
  req.body.fromAPI = true;
  let err;
  if( !req.body.assessment
    || ( !req.user.isAssessorFor( req.body.assessment )
    && !req.user.isAssesseeFor( req.body.assessment ) ) ){
    err = new errors.Http403Error( {
      message: "Not Allowed",
      explanation: "You're not registered to this assessment"
    } );
  }
  base.handleResult( err || base.create( req ), res, next );
};
