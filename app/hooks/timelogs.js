'use strict';

const keystone = require( 'keystone' );
const handleHook = require( './helpers/handleHook' );
const timelogsService = require( '../services/timelogs' );

function removeTimelogsForComparison( comparison ){
  return timelogsService.list( {
      comparison: comparison.id
    } )
    .mapSeries( ( timelog )=>timelog.remove() );
}

module.exports.init = function(){
  keystone.list( 'Comparison' ).schema.pre( 'remove', handleHook( removeTimelogsForComparison ) );
};
