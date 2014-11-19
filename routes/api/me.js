'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var async = require( 'async' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.me' );
var constants = require( '../../models/helpers/constants' );
var Promise = require( 'bluebird' );

var comparisons = require( '../../services/comparisons' );
var personas = require( '../../services/personas' );
var mementos = require( '../../services/mementos' );

function _listAssessments( opts ){
  var output = [];
  return personas.listAssessments( {
    user : opts.assessor,
    role : opts.role
  } ).then( function( assessments ){
    var promises = [];
    _.each( assessments, function( assessment ){
      var p = comparisons.completedCount( {
        assessor   : opts.assessor,
        assessment : assessment._id
      } ).then( function handleComparisonsNum( completedComparisons ){
        if( completedComparisons < assessment.comparisonsNum ){
          output.push( assessment );
          //return assessment;
        }
      } );
      promises.push( p );
    } );
    return Promise.all( promises );
  } ).then( function(){
    return output;
  } );
}

var createMemento = module.exports.createMemento = function( req,
                                                             res,
                                                             next ){
  debug( '#create' );
  mementos.create( {
    assessor   : req.user.id,
    assessment : req.param( 'assessment' )
  } ).onResolve( function( err,
                           result ){
    if( err ){
      return next( err );
    }

    res.apiResponse( result );
  } );
};

module.exports.listMementos = function( req,
                                        res,
                                        next ){
  debug( '#listMementos' );
  var assessor = req.param("assessor") || req.user.id;
  mementos.listActives( {
    assessor : assessor
  } ).onResolve( function( err,
                           result ){
    if( err ){
      return next( err );
    }

    if( !result || result.length <= 0 ){
      _listAssessments( {
        assessor : assessor,
        role : constants.roles.assessor
      } ).then( function( assessments ){
        if( assessments && assessments.length > 0 ){
          mementos.create( {
            assessor   : assessor,
            assessment : assessments[0]._id
          } ).onResolve( function( err,
                                   result ){
            if( err ){
              return next( err );
            }

            res.apiResponse( [result] );
          } );
        }else{
          res.apiResponse( [] );
        }
      } );
    }else{
      //in progress
      res.apiResponse( result );
    }
  } );
};

module.exports.listAssessments = function( req,
                                           res,
                                           next ){
  debug( '#listAssessments' );

  var assessor = req.param("assessor") || req.user.id;
  _listAssessments( {
    assessor : assessor,
    role     : constants.roles.assessor
  } ).onResolve( function( err,
                           assessments ){

    if( err ){
      return next( err );
    }
    res.apiResponse( assessments );
  } );
};
