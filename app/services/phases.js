"use strict";
// const debug = require( "debug" )( "dpac:services.phases" );
const keystone = require( "keystone" );
const collection = keystone.list( "Phase" );
const Service = require( "./helpers/Service" );
const base = new Service( collection );
module.exports = base.mixin();
