"use strict";
var debug = require( "debug" )( "dpac:services.assessments" );
var _ = require( "lodash" );

var keystone = require( "keystone" );
var schema = keystone.list( "Assessment" );
var Service = require( "./helpers/Service" );
var constants = require("../models/helpers/constants");
var base = new Service( schema );
module.exports = base.mixin();

module.exports.list = function list( opts ){
  debug( "list" );
  opts = _.defaults( {}, opts, {
    state : constants.assessmentStates.PUBLISHED
  } );
  return base.list( opts )
    .execAsync();
};

module.exports.listById = function listById( ids,
                                             opts ){
  debug( "listById" );
  opts = _.defaults( {}, opts, {
    state : constants.assessmentStates.PUBLISHED
  } );
  return base.listById( ids, opts )
    .execAsync();
};
