'use strict';

var debug = require( "debug" )( "dpac:api.reports" );

var service = require( "../../services/reports" );
var convertersService = require( '../../services/converters' );
var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
var moment = require( 'moment' );

function constructFilename( name,
                            ext ){
  return [ name, '-', moment().format( "YYMMDD-HHmmss" ), '.', ext ].join( '' );
}

module.exports.listComparisons = function( req,
                                           res,
                                           next ){
  var format = req.params.format;
  var p = service.listComparisons();
  switch( format ){
    case 'csv':
      p = p.then( function( docs ){
        return convertersService.jsonToCSV( docs );
      } );
      break;
  }
  p.then( function( results ){
    res.attachment( constructFilename( "comparisons", format ) );
    res.status( 200 ).send( results );
  } ).catch( function( err ){
    next( err );
  } );
};

module.exports.listRepresentations = function( req,
                                               res,
                                               next ){
  var format = req.params.format;
  var p = service.listRepresentations();
  switch( format ){
    case 'csv':
      p = p.then( function( docs ){
        return convertersService.jsonToCSV( docs );
      } );
      break;
  }
  p.then( function( results ){
    res.attachment( constructFilename( "representations", format ) );
    res.status( 200 ).send( results );
  } ).catch( function( err ){
    next( err );
  } );
};
