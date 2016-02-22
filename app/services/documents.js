"use strict";
var debug = require( "debug" )( "dpac:services.documents" );

var keystone = require( "keystone" );
var collection = keystone.list( "Document" );
var Service = require( "./helpers/Service" );
var base = new Service( collection );
module.exports = base.mixin();
