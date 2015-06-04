"use strict";

var debug = require( "debug" )( "dpac:api.notes" );
var errors = require( 'errors' );
var service = require( "../../services/notes" );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();
