"use strict";

var debug = require( "debug" )( "dpac:api.comparisons" );

var service = require( "../../services/comparisons" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();

module.exports.create = function(req, res, next){
  req.body.assessor = req.user;
  base.handleResult( base.create( req ), res, next );
};
