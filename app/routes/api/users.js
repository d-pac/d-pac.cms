"use strict";

var debug = require( "debug" )( "dpac:api.users" );

var service = require( "../../services/users" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();

module.exports.listAssessments = function( req,
                                           res,
                                           next ){
  base.handleResult( service.listAssessments( {
    _id : req.param( "_id" )
  } ), res, next );
};
