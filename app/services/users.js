"use strict";

var keystone = require( "keystone" );
var debug = require( "debug" )( "dpac:services.users" );
var schema = keystone.list( "User" );
var Service = require( "./helpers/Service" );
var assessments = require( "./assessments" );

var base = new Service( schema );
module.exports = base.mixin();

/**
 *
 * @param opts
 * @param opts._id schema.id
 * @returns {Promise}
 */
module.exports.retrieve = function retrieve( opts ){
  debug( "#retrieve", opts );

  return base.retrieve( opts )
    .populate( "organization" )
    .execAsync();
};

module.exports.listAssessments = function listAssessments( opts ){
  debug( "#listAssessments" );
  return base.retrieve( opts )
    .execAsync()
    .then( function( user ){
      console.log("USER", user);
      return assessments.listById( user.assessments );
    } );
};

module.exports.update = function update( opts ){
  debug( "#update" );
  return base.update( this.retrieve( opts ), opts )
    .execAsync();
};
