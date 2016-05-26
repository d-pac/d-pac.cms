"use strict";
// var debug = require( "debug" )( "dpac:services.organizations" );

var keystone = require( "keystone" );
var collection = keystone.list( "Organization" );
var Service = require( "./helpers/Service" );
var base = new Service( collection );
module.exports = base.mixin();
