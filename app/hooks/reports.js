'use strict';

var keystone = require( 'keystone' );
var moment = require( "moment" );
var _ = require( 'lodash' );
var P = require( 'bluebird' );
var fs = P.promisifyAll( require( "fs" ) );
var path = require( 'path' );

var assessmentsService = require( '../services/assessments' );
var reportsService = require( '../services/reports' );
var convertersService = require( '../services/converters' );

var reportsDir = __dirname + "/../reports";

function updateDoc( report,
                    assessmentName ){
  var compiled = _.template( report.filename, {
    interpolate: /{{([\s\S]+?)}}/g
  } );
  report.filename = compiled( {
    ext: report.format,
    time: moment().format( 'YYYYMMDD-HHmmss' ),
    assessment: assessmentName,
    datatype: report.datatype
  } );
  return P.resolve( report );
}

function writeFile( report,
                    reportData ){
  return fs.writeFileAsync( path.join( reportsDir, report.filename ), reportData );
}

function removeFile( report ){
  if( !report.filename ){
    return;
  }

  return fs
    .unlinkAsync( path.join( reportsDir, report.filename ) )
    .catch( function( err ){
      console.log( err );
    } )
}

function reportCreatedHandler( next ){
  if( this.isNew ){
    var report = this;
    var p;
    if( report.assessment ){
      p = assessmentsService.retrieve( {
        _id: report.assessment.toString()
      } ).then( function( assessment ){
        return updateDoc( report, assessment.name );
      } );
    } else {
      p = updateDoc( report, 'All' );
    }
    p.then( function(){
      switch( report.datatype ){
        case "representations":
          return reportsService.listRepresentations( report.assessment.toString() );
        case "comparisons":
          return reportsService.listComparisons( report.assessment.toString() );
        default:
          throw new Error( 'Invalid data type' );
      }
    } ).then( function( jsonData ){
      switch( report.format ){
        case 'csv':
          return convertersService.jsonToCSV( jsonData );

        case 'json':
        default:
          return P.resolve( JSON.stringify( jsonData, 2 ) );
      }
    } ).then( function( reportData ){
      return writeFile( report, reportData );
    } ).then( function(){
      next();
    } ).catch( next );
  } else {
    next();
  }
}

function reportRemovedHandler( next ){
  var report = this;
  removeFile( report ).then( function(){
    next();
  } ).catch( next );
}

module.exports.init = function(){

  keystone.list( 'Report' ).schema.pre( 'save', reportCreatedHandler );
  keystone.list( 'Report' ).schema.pre( 'remove', reportRemovedHandler );
};
