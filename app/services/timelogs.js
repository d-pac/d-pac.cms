"use strict";

var debug = require( "debug" )( "dpac:services.timelogs" );
var keystone = require( "keystone" );
var schema = keystone.list( "Timelog" );

var Service = require( "./helpers/Service" );
var base = new Service( schema );
module.exports = base.mixin();

module.exports.list = function list( opts ){
  debug( "list" );
  return base.list( opts )
    .sort( "comparison begin" )
    .execAsync();
};

module.exports.listForComparisonIds = function listForComparisonIds( opts,
                                                                     comparisonIds ){
  return base.list( opts )
    .where( "comparison" ).in( comparisonIds )
    .populate("phase", "slug")
    .execAsync();
};
