'use strict';

// const debug = require( "debug" )( "dpac:services.messages" );

const keystone = require( "keystone" );
const collection = keystone.list( "Message" );
const Service = require( "./helpers/Service" );
const base = new Service( collection );
module.exports = base.mixin();

