"use strict";

var debug = require( "debug" )( "dpac:api.pages" );
var errors = require( 'errors' );
var service = require( "../../services/pages" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();

module.exports.list = function list( req,
                                     res,
                                     next ){
  debug( "#list" );

  base.handleResult( service.list( {
    expose: "api"
  } ), res, next );
};

module.exports.retrieve = function retrieve( req,
                                             res,
                                             next ){
  debug( "#retrieve" );
  base.handleResult( service.retrieve( {
      slug: req.params.slug,
      expose: "api"
    } )
    .then( function( result ){
      if( !result ){
        throw new errors.Http404Error();
      }
      return result;
    } ), res, next );
};
