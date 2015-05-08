"use strict";

var debug = require( "debug" )( "dpac:api.users" );

var service = require( "../../services/users" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();

module.exports.listAssessments = function( req,
                                           res,
                                           next ){
  debug("#listAssessments");
  base.handleResult( service.listAssessments( {
    _id : req.param( "_id" )
  } ), res, next );
};

module.exports.listComparisons = function( req,
                                           res,
                                           next ){
  debug("#listComparisons");
  base.handleResult( service.listComparisons( {
    _id : req.param( "_id" )
  } ), res, next );
};

module.exports.listMementos = function( req,
                                        res,
                                        next ){
  debug("#listMementos");
  base.handleResult( service.listMementos( {
    _id : req.param( "_id" )
  } ), res, next );
};
