'use strict';

var _ = require( 'lodash' );
var P = require( 'bluebird' );
var csv = P.promisifyAll( require( "fast-csv" ) );

module.exports.jsonToCSV = function jsonToCSV( data,
                                               opts ){
  opts = _.defaults( {
    headers: true,
    quoteColumns: true
  }, opts );
  return csv.writeToStringAsync( data, opts );
};
