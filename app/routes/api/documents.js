"use strict";

// var debug = require( "debug" )( "dpac:api.documents" );

var service = require( "../../services/documents" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();
