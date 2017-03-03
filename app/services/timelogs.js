"use strict";

const debug = require( "debug" )( "dpac:services.timelogs" );
const keystone = require( "keystone" );
const collection = keystone.list( "Timelog" );
const _ = require( 'lodash' );

const Service = require( "./helpers/Service" );
const base = new Service( collection );
module.exports = base.mixin();

module.exports.list = function list( opts ){
  debug( "list" );
  return base.list( opts )
    .sort( "comparison begin" )
    .exec();
};

module.exports.listForComparisonIds = function listForComparisonIds( comparisonIds,
                                                                     opts ){
  if( comparisonIds && _.isString( comparisonIds ) ){
    comparisonIds = [ comparisonIds ];
  }
  return base.list( opts )
    .where( "comparison" ).in( comparisonIds )
    .exec();
};

module.exports.retrieveFinalForComparisons = function( phaseId, comparisonIds){
  return base.list( {
      phase: phaseId
    } )
    .where("comparison").in(comparisonIds)
    .sort( "-end" )
    .exec()
    .then( function( timelogs ){
      if( timelogs && timelogs.length ){
        return _.chain(timelogs)
          .groupBy("comparison")
          .reduce(function(memo, timelogs, id){
            memo[id] = timelogs[0];
            return memo;
          }, {})
          .value();
      }
      return {};
    } );
};
