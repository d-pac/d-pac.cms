"use strict";

var debug = require( "debug" )( "dpac:api.representations" );

var service = require( "../../services/representations" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();
