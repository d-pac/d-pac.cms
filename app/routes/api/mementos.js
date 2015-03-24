"use strict";

var debug = require( "debug" )( "dpac:api.mementos" );

var service = require( "../../services/mementos" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );

module.exports.create = function create( req,
                                         res,
                                         next ){
  debug( "#create" );

  base.handleResult( service.create( {
    assessor   : req.user.id,
    assessment : req.param( 'assessment' )
  } ), res, next );
};
