"use strict";

var debug = require( "debug" )( "dpac:api.phases" );

var service = require( "../../services/phases" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();
