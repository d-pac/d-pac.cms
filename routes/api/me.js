'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var async = require( 'async' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.me' );
var constants = require( '../../models/helpers/constants' );

var personas = require( '../../services/personas' );
var mementos = require('../../services/mementos');

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

  personas.list( {
    user : req.user.id,
    role : constants.roles.assessor
  } ).onResolve( function( err,
                           personas ){
    if( err ){
      return next( err );
    }
    personas = personas.filter( function( doc ){
      return doc.assessment.state === constants.publicationStates.published;
    } );
    var assessments = _.map( personas, function( persona ){
      return persona.assessment;
    } );
    res.apiResponse( assessments );
  } );
};
