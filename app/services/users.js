"use strict";

var keystone = require( "keystone" );
var _ = require( "underscore" );
var debug = require( "debug" )( "dpac:services.users" );
var schema = keystone.list( "User" );
var Service = require( "./helpers/Service" );
var assessmentsService = require( "./assessments" );
var mementosService = require( "./mementos" );
var comparisonsService = require( "./comparisons" );

var base = new Service( schema );
module.exports = base.mixin();

/**
 *
 * @param opts
 * @param opts._id schema.id
 * @returns {Promise}
 */
module.exports.list = function list( opts ){
  debug( "#list", opts );

  return base.list( opts )
    .execAsync();
};
/**
 *
 * @param opts
 * @param opts._id schema.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieve( opts ){
  debug( "#retrieve", opts );

  return base.retrieve( opts )
    .execAsync();
};

module.exports.listAssessments = function listAssessments( opts ){
  debug( "#listAssessments" );
  return base.retrieve( opts )
    .execAsync()
    .then( function( user ){
      return assessmentsService.listById( user.assessments );
    } );
};

module.exports.listComparisons = function listComparisons( opts ){
  return this.listAssessments( opts )
    .then( function( assessments ){
      return comparisonsService.listForAssessments( {
        assessor: opts._id
      },_.pluck( assessments, "_id" ) );
    } );
};

module.exports.listMementos = function listMementos( opts ){
  return base.retrieve( opts )
    .execAsync()
    .then( function( user ){
      return mementosService.list( {
        assessor: user._id
      } );
    } );
};

module.exports.update = function update( opts ){
  debug( "#update" );
  return base.update( this.retrieve( opts ), opts )
    .execAsync();
};
