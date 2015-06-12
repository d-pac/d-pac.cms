'use strict';
var reportsService = require( '../app/services/reports' );
var convertersService = require( '../app/services/converters' );
var P = require( 'bluebird' );
var fs = P.promisifyAll( require( 'fs' ) );

module.exports = function( assessmentId,
                           file,
                           done ){
  reportsService.listComparisons( [ assessmentId ] ).then( function( comparisons ){
    return convertersService.jsonToCSV( comparisons );
  } ).then( function( csv ){
    return fs.writeFileAsync( file, csv );
  } ).then( done ).catch( done );
};
