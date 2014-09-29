'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var async = require( 'async' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.me' );

var createAggregate = require( '../../services/createAggregate' );
var retrieveRepresentationPair = require( '../../services/retrieveRepresentationPair' );

var Persona = keystone.list( 'Persona' );
var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );

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

  async.waterfall( [
    function( done ){
      retrieveRepresentationPair( done );
    },
    function( representations,
              done ){
      createAggregate( {
        assessment      : req.param( 'assessment' ),
        assessor        : req.user.id,
        representations : representations
      }, done );
    }
  ], function( err,
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

  var promise, comparison, output = [];

  function getActiveComparison(){
    return Comparison.model
      .find( {
        assessor : req.user.id
      } )
      .where( 'phase' ).ne( null )
      .populate( 'assessment' )
      .exec();
  }

  function getJudgements( comparisons ){
    if( comparisons && comparisons.length > 0 ){
      comparison = comparisons[0];
      console.log('comparison', comparison);
      return Judgement.model
        .find()
        .where( 'comparison', comparison )
        .populate( 'representation' )
        .exec()
        .then( assembleAggregate );
    }else{
      promise.fulfill();
    }
  }

  function assembleAggregate( judgements ){
    output.push( {
      comparison      : comparison,
      assessment      : comparison.assessment,
      judgements      : judgements,
      representations : _.pluck( judgements, "representation" )
    });
    console.log('output', output);
    promise.fulfill();
  }

  promise = getActiveComparison();
  promise.then( getJudgements )
    .onResolve( function( err ){
      res.apiResponse( output );
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
