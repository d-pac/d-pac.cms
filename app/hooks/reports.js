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

const reportsDir = constants.directories.reports;

const templateOpts = { interpolate: /{{([\s\S]+?)}}/g };
const templates = {
  success: _.template( 'Report successfully generated: ' +
    '<a href="{{ url }}" target="_blank">{{ filename }}</a>', templateOpts ),
  failure: _.template( 'An error occurred when generating the report: {{message}}', templateOpts )
};

function updateDoc( report,
                    assessmentName ){
  const compiled = _.template( report.filename, {
    interpolate: /{{([\s\S]+?)}}/g
  } );
  const ext = report.format;
  const filename = _.kebabCase( compiled( {
    time: moment().format( 'YYYYMMDD-HHmmss' ),
    assessment: assessmentName,
    datatype: report.datatype
  } ) );
  report.filename = filename + "." + ext;
  report.url = '/reports/' + report.filename;
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
  const report = this;
  if( report.isNew ){
    let p, assessmentId;
    if( report.assessment ){
      assessmentId = report.assessment.toString();
      p = assessmentsService.retrieve( {
          _id: assessmentId
        } )
        .then( function( assessment ){
          return updateDoc( report, assessment.name );
        } );
    } else {
      p = updateDoc( report, 'All' );
    }
    p.then( function(){
        switch( report.datatype ){
          case "representations":
            return reportsService.listRepresentations( assessmentId );
          case "comparisons":
            return reportsService.listComparisons( assessmentId );
          default:
            throw new Error( 'Invalid data type' );
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
        next();
      } )
      .catch( function( err ){
        report.result = templates.failure( err );
        next( err );
      } );
  } else {
    next();
  }
}

function reportRemovedHandler( next ){
  const report = this;
  removeFile( report )
    .then( function(){
      next();
    } )
    .catch( next );
}

module.exports.init = function(){
  keystone.list( 'Report' ).schema.pre( 'save', reportCreatedHandler );
  keystone.list( 'Report' ).schema.pre( 'remove', reportRemovedHandler );
};
