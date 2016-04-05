'use strict';

const keystone = require( 'keystone' );
const moment = require( "moment" );
const _ = require( 'lodash' );
const P = require( 'bluebird' );
const fs = P.promisifyAll( require( "fs" ) );
const path = require( 'path' );

const assessmentsService = require( '../services/assessments' );
const reportsService = require( '../services/reports' );
const convertersService = require( '../services/converters' );
const constants = require( '../models/helpers/constants' );

const handleHook = require( './helpers/handleHook' );

const reportsDir = constants.directories.reports;

const templateOpts = { interpolate: /{{([\s\S]+?)}}/g };
const templates = {
  success: _.template( 'Report successfully generated: ' +
    '<a href="{{ url }}" target="_blank">{{ filename }}</a>', templateOpts ),
  failure: _.template( 'An error occurred when generating the report: {{message}}', templateOpts )
};

function setMetadata( report,
                      title ){
  const compiled = _.template( report.filename, {
    interpolate: /{{([\s\S]+?)}}/g
  } );
  const ext = report.format;
  const filename = _.kebabCase( compiled( {
    time: moment().format( 'YYYYMMDD-HHmmss' ),
    title: title,
    datatype: report.datatype
  } ) );
  report.filename = filename + "." + ext;
  report.url = '/reports/' + report.filename;
  report.title = title;
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

function generateReportFile( report ){
  if( !report.isNew ){
    return P.resolve();
  }
  let p;
  if( report.title ){
    p = P.resolve( report.title );
  } else {
    switch( report.assessments.length ){
      case 0:
        p = P.resolve( 'All' );
        break;
      case 1:
        p = assessmentsService.retrieve( { _id: report.assessments[ 0 ] } )
          .then( ( assessment )=>assessment.name );
        break;
      default:
        p = P.resolve( 'Multiple' );
        break;
    }
  }
  p.then( ( title )=>{
      setMetadata( report, title );
    } )
    .then( function(){
      switch( report.datatype ){
        case "representations":
          return reportsService.listRepresentations( report.assessments );
        case "comparisons":
          return reportsService.listComparisons( report.assessments );
        default:
          return P.reject( new Error( 'Invalid data type' ) );
      }
    } )
    .then( function( jsonData ){
      switch( report.format ){
        case 'csv':
          return convertersService.jsonToCSV( jsonData );

        case 'json':
        default:
          return P.resolve( JSON.stringify( jsonData, 2 ) );
      }
    } )
    .then( function( reportData ){
      return writeFile( report, reportData );
    } )
    .then( function(){
      report.result = templates.success( report );
    } );
  return p;
}

function removeReportFile( report ){
  return removeFile( report );
}

module.exports.init = function(){
  keystone.list( 'Report' ).schema.pre( 'save', handleHook( generateReportFile ) );
  keystone.list( 'Report' ).schema.pre( 'remove', handleHook( removeReportFile ) );
};
