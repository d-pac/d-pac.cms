"use strict";

var debug = require( "debug" )( "dpac:api.timelogs" );

var service = require( "../../services/timelogs" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();
