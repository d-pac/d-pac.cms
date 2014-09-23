'use strict';

var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var async = require( 'async' );
var errors = require( 'errors' );
var debug = require( 'debug' )( 'dpac:api.me' );

var createAggregateComparison = require( '../../services/createAggregateComparison' );
var retrieveRepresentationPair = require( '../../services/retrieveRepresentationPair' );

var Persona = keystone.list( 'Persona' );
var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );

var constants = require('../../models/helpers/constants');

module.exports.prepareForAccount = function prepareForAccount( req,
                                                               res,
                                                               next ){
  debug( '#prepareForAccount' );
  res.locals.filter = {
    user : req.user.id
  };

  next();
};

module.exports.prepareForComparison = function prepareForComparison( req,
                                                                     res,
                                                                     next ){
  debug( '#prepareForComparison' );
  res.locals.filter = {
    assessor : req.user.id,
    active   : true
  };
  next();
};

module.exports.createComparison = function( req,
                                            res,
                                            next ){
  debug( '#createComparison' );

  async.waterfall( [
    function( done ){
      retrieveRepresentationPair( done );
    },
    function( representations,
              done ){
      createAggregateComparison( {
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

module.exports.retrieveActiveComparisons = function( req,
                                                     res,
                                                     next ){
  //todo:refactor
  Comparison.model
    .find( {
      active   : true,
      assessor : req.user.id
    } )
    .populate( 'assessment' )
    .exec( function( err,
                     comparisons ){
      var output = [];
      async.each( comparisons, function( comparison,
                                         done ){
        Judgement.model.find( {
          comparison : comparison.id
        } )
          .populate( 'representation' )
          .exec( function( err,
                           judgements ){
            output.push( {
              comparison : comparison,
              assessment : comparison.assessment,
              judgements : judgements,
              representations : _.pluck(judgements, "representation")
            } );
            done();
          } );
      }, function( err,
                   result ){
        if( err ){
          return next( err );
        }
        res.apiResponse( output );
      } );
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
