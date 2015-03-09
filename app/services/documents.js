"use strict";
var debug = require( "debug" )( "dpac:services.documents" );

var keystone = require( "keystone" );
var schema = keystone.list( "Document" );
var Service = require( "./helpers/Service" );
var base = new Service( schema );
module.exports = base.mixin();
