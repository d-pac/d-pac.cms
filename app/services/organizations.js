"use strict";
var debug = require( "debug" )( "dpac:services.organizations" );

var keystone = require( "keystone" );
var schema = keystone.list( "Organization" );
var Service = require( "./helpers/Service" );
var base = new Service( schema );
module.exports = base.mixin();
