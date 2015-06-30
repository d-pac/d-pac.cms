"use strict";
var debug = require( "debug" )( "dpac:services.phases" );
var keystone = require( "keystone" );
var schema = keystone.list( "Phase" );
var Service = require( "./helpers/Service" );
var base = new Service( schema );
module.exports = base.mixin();
