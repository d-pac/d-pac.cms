"use strict";

// var debug = require( "debug" )( "dpac:api.assessments" );

var service = require( "../../services/assessments" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();
