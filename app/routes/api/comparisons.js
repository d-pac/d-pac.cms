"use strict";

var debug = require( "debug" )( "dpac:api.comparisons" );

var service = require( "../../services/comparisons" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();
