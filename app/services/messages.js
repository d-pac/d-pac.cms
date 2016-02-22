'use strict';

var debug = require( "debug" )( "dpac:services.messages" );

var keystone = require( "keystone" );
var collection = keystone.list( "Message" );
var Service = require( "./helpers/Service" );
var base = new Service( collection );
module.exports = base.mixin();

