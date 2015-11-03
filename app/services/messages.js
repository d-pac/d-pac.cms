'use strict';

var debug = require( "debug" )( "dpac:services.messages" );

var keystone = require( "keystone" );
var schema = keystone.list( "Message" );
var Service = require( "./helpers/Service" );
var base = new Service( schema );
module.exports = base.mixin();

