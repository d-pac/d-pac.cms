"use strict";
var keystone = require( 'keystone' );
var async = require( 'async' );
var _ = require( 'lodash' );
var assessmentsService = require( '../services/assessments' );
var Assessment = keystone.list( 'Assessment' );
var P = require( 'bluebird' );

exports = module.exports = function( done ){
  assessmentsService
    .list( {} )
    .map(function(doc){
      return JSON.parse( JSON.stringify( doc ) );
    })
    .filter( function( doc ){
      return !_.isUndefined( doc.comparisonsNum.stage );
    } )
    .map( function( doc ){
      doc.comparisonsNum = {
        perRepresentation: doc.comparisonsNum.total,
        perAssessor: doc.comparisonsNum.stage
      };
      return doc;
    } )
    .then( function( assessments ){
      async.eachSeries( assessments, function( assessment,
                                               next ){
        Assessment.model.update( { _id: assessment._id }, assessment, next );
      }, done );
    } )
    .catch(done);
};
