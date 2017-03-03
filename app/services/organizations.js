"use strict";
// const debug = require( "debug" )( "dpac:services.organizations" );

const keystone = require( "keystone" );
const collection = keystone.list( "Organization" );
const Service = require( "./helpers/Service" );
const base = new Service( collection );
module.exports = base.mixin();
