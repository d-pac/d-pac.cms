"use strict";
// var debug = require( "debug" )( "dpac:services.phases" );
var keystone = require( "keystone" );
var collection = keystone.list( "Phase" );
var Service = require( "./helpers/Service" );
var base = new Service( collection );
module.exports = base.mixin();
