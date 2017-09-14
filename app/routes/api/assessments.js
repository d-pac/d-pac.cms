"use strict";

// const debug = require( "debug" )( "dpac:api.assessments" );

const service = require( "../../services/assessments" );
const Controller = require( "./helpers/Controller" );
const base = new Controller( service );
module.exports = base.mixin();

