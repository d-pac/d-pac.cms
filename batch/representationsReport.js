'use strict';
var _ = require( 'underscore' );
var reportsService = require( '../app/services/reports' );
var convertersService = require( '../app/services/converters' );
var P = require( 'bluebird' );
var fs = P.promisifyAll( require( 'fs' ) );
var microtime = require( 'microtime' );

module.exports = function( assessmentIds,
                           file,
                           done ){
  if( _.isString( assessmentIds ) ){
    assessmentIds = assessmentIds.split( "," );
  }
  var t0 = microtime.now();
  reportsService.listRepresentations( assessmentIds ).then( function( representations ){
    return convertersService.jsonToCSV( representations );
  } ).then( function( csv ){
    var t1 = microtime.now();
    var t = (t1-t0);
    console.log('Processed in:' + t + ' μs (' + (t/1000000).toPrecision(3) + ' s)');
    return fs.writeFileAsync( file, csv );
  } ).then( done ).catch( done );
};
