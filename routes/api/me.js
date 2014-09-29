'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var async = require( 'async' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.me' );

var createAggregate = require( '../../services/createAggregate' );
var retrieveActiveAggregates = require( '../../services/retrieveActiveAggregates' );

var Persona = keystone.list( 'Persona' );

var constants = require( '../../models/helpers/constants' );

module.exports.prepareForAccount = function prepareForAccount( req,
                                                               res,
                                                               next ){
  debug( '#prepareForAccount' );
  res.locals.filter = {
    user : req.user.id
  };

  next();
};

module.exports.prepareForAggregate = function prepareForAggregate( req,
                                                                   res,
                                                                   next ){
  debug( '#prepareForAggregate' );
  res.locals.filter = {
    assessor : req.user.id,
    active   : true
  };
  next();
};

module.exports.createAggregate = function( req,
                                           res,
                                           next ){
  debug( '#createAggregate' );
  createAggregate( {
    assessment : req.param( 'assessment' ),
    assessor   : req.user.id
  }, function( err,
               result ){
    if( err ){
      return next( err );
    }

    return res.apiResponse( result );
  } );
};

module.exports.retrieveActiveAggregates = function( req,
                                                    res,
                                                    next ){
  debug( '#retrieveActiveAggregates' );
  retrieveActiveAggregates( {
    assessor : req.user.id
  }, function( err,
               aggregate ){
    if( err ){
      return next( err );
    }

    res.apiResponse( aggregate );
  } );
};

module.exports.retrieveAssessments = function( req,
                                               res,
                                               next ){
  debug( '#retrieveAssessments' );

  Persona.model
    .find( {
      user : req.user.id,
      role : constants.roles.assessor
    } )
    .populate( 'assessment' )
    .exec( function( err,
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
