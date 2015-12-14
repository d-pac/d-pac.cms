'use strict';
var _ = require( 'lodash' );
var P = require( 'bluebird' );
var path = require( 'path' );

var phasesService = require( '../services/phases' );
var comparisonsService = require( '../services/comparisons' );
var timelogsService = require( '../services/timelogs' );

var log = _.partial( console.log, path.basename( __filename ) + ':' );

exports = module.exports = function( done ){
  P.join( phasesService.list( {
      slug: 'selection'
    } ),
    comparisonsService.list( {
      selectionMadeAt: null
    } ),
    function( phases,
              comparisons ){
      var selectionPhase = phases[ 0 ];
      comparisons = _.reduce( comparisons, function( memo,
                                                     comparison ){
        var id = comparison.id;
        memo.map[ id ] = comparison;
        memo.keys.push( id );
        return memo;
      }, {
        keys: [],
        map: {}
      } );
      return timelogsService.retrieveFinalForComparisons( selectionPhase.id, comparisons.keys )
        .then( function( timelogsByComparisonId ){
          return _.reduce( timelogsByComparisonId, function( saveQueue,
                                                             timelog,
                                                             comparisonId ){
            var comparison = comparisons.map[ comparisonId ];
            comparison.selectionMadeAt = timelog.end;
            saveQueue.push( comparison );
            return saveQueue;
          }, [] );
        } )
    } )
    .then( function( saveQueue ){
      //we're going to yield here, to allow keystone bootstrapping to continue
      done();
      return saveQueue;
    } )
    .each( function( doc ){
      return P.promisify( doc.save, doc )();
    } )
    .then( function( comparisons ){
      log( 'Updated', comparisons.length, "comparisons" );
    } );
};
