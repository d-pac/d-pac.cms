'use strict';
var debug = require( 'debug' )( 'dpac:services.personas' );
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var schema = keystone.list( 'Persona' );
var constants = require( '../models/helpers/constants' );

var listById = module.exports.listById = function listById( ids ){
  return schema.model
    .find()
    .where( '_id' ).in( ids )
    .populate( 'assessment' )
    .exec();
};

var list = module.exports.list = function list( opts ){
  debug( 'list' );
  if( _.isArray( opts ) ){
    return listById( opts );
  }

  return schema.model
    .find( opts )
    .populate( 'assessment' )
    .exec();
};

module.exports.listAssessments = function listAssessments( opts ){
  debug( "#listAssessments" );
  return list( opts )
    .then( function handlePersonas( docs ){
      return _.chain( docs )
        .map( function( persona ){
          return persona.assessment;
        } )
        .filter( function( assessment ){
          return !!assessment && (assessment.state === constants.publicationStates.published);
        } )
        .value();
    } );
}
