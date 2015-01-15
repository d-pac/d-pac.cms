"use strict";
var debug = require( "debug" )( "dpac:api.admin" );
var _ = require( "underscore" );
var Bluebird = require( "bluebird" );
var keystone = require( "keystone" );
var assessmentsService = require( "../../services/assessments" );
var ObjectId = require( "mongoose" ).Types.ObjectId;

var Representation = keystone.list( "Representation" );

module.exports.duplicateRepresentations = function( req,
                                                    res,
                                                    next ){
  debug( "duplicateRepresentations" );
  assessmentsService.list()
    .then( function listAssessments( assessments ){
      return _.pluck( assessments, "_id" );
    } )
    .then( function listDuplicates( assessmentIds ){
      var promises = _.map( assessmentIds, function( assessment ){
        return Representation.model
          .aggregate( [
            {
              $match : {
                assessment : new ObjectId( assessment )
              }
            },
            {
              $group : {
                _id         : {
                  "file.filename" : "$file.filename"
                },
                occurrences : {
                  $sum : 1
                },
                assessment  : {
                  $addToSet : "$assessment"
                }
              }
            },
            {
              $match : {
                occurrences : {
                  $gte : 2
                }
              }
            },
            {
              $project : {
                _id             : 1,
                "file.filename" : 1,
                assessment      : 1,
                occurrences     : 1
              }
            },
            {
              $sort : {
                occurrences : -1
              }
            }
          ] ).exec();
      } );

      return Bluebird.all( promises );
    } )
    .onResolve( function( err,
                          results ){
      if( err ){
        return next( err );
      }

      res.apiResponse( results );
    } );
};
