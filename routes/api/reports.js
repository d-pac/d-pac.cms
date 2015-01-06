'use strict';

var debug = require( 'debug' )( 'dpac:api.reports' );
var _ = require( "underscore" );
var csv = require('fast-csv');
var Bluebird = require('bluebird');
var moment = require('moment');

var assessmentsService = require( '../../services/assessments' );
var comparisonsReporting = require( '../../services/comparisons-report' );

module.exports.comparisons = function reportComparisons( req,
                                                         res,
                                                         next ){

  debug("comparisons");
  assessmentsService.list()
    .then( function( assessments ){
      var ids = _.pluck( assessments, "_id" );
      return comparisonsReporting( ids );
    } )
    .then(function(comparisons){
      var writeToString = Bluebird.promisify(csv.writeToString);
      return writeToString(comparisons, { headers : true, quoteColumns : true });
    })
    .onResolve( function( err,
                          results ){
      if( err ){
        return next( err );
      }

      res.attachment('comparisons-'+moment().format('YYMMDD-HHmmss')+'.csv');
      res.send(200, results);

    } );
};
