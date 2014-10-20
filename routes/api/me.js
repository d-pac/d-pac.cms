'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var async = require( 'async' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.me' );
var constants = require( '../../models/helpers/constants' );
var Promise = require('bluebird');

var comparisons = require( '../../services/comparisons' );
var personas = require( '../../services/personas' );
var mementos = require( '../../services/mementos' );

module.exports.listMementos = function( req,
                                        res,
                                        next ){
  debug( '#listMementos' );
  mementos.listActives( {
    assessor : req.user.id
  } ).onResolve( function( err,
                           result ){
    if( err ){
      return next( err );
    }

    res.apiResponse( result );
  } );
};

module.exports.createMemento = function( req,
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

module.exports.listAssessments = function( req,
                                           res,
                                           next ){
  debug( '#listAssessments' );

  var output = [];
  personas.list( {
    user : req.user.id,
    role : constants.roles.assessor
  } ).then( function handlePersonas( docs ){
    return _.chain( docs )
      .map( function( persona ){
        return persona.assessment;
      } )
      .filter( function( assessment ){
        return assessment.state === constants.publicationStates.published;
      } )
      .value();
  } ).then( function( assessments ){
    var promises = [];
    _.each( assessments, function( assessment ){
      var p = comparisons.completedCount( {
        assessor : req.user.id,
        assessment : assessment._id
      } ).then( function handleComparisonsNum( completedComparisons ){
        if(completedComparisons < assessment.comparisonsNum){
          output.push(assessment);
        }
      } );
      promises.push(p);
    } );
    return Promise.all(promises);
  } ).onResolve( function( err,
                           assessments ){
    if( err ){
      return next( err );
    }
    res.apiResponse( output );
  } );
};
