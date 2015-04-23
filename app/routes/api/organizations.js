"use strict";

var debug = require( "debug" )( "dpac:api.organizations" );

var service = require( "../../services/organizations" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();
