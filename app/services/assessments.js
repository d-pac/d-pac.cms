"use strict";
var debug = require( "debug" )( "dpac:services.assessments" );
var _ = require( "lodash" );

var keystone = require( "keystone" );
var collection = keystone.list( "Assessment" );
var Service = require( "./helpers/Service" );
var constants = require("../models/helpers/constants");
var base = new Service( collection );
module.exports = base.mixin();

module.exports.listPublished = function listPublished( opts ){
  debug( "listPublished" );
  return base.list( _.defaults( opts, {
      state: constants.assessmentStates.PUBLISHED
    } ) )
    .exec();
};
