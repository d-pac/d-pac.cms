var keystone = require( 'keystone' );
var async = require( 'async' );
var _ = require( "underscore" );
var constants = require( "../models/helpers/constants" );
var Phase = keystone.list( 'Phase' );
var Comparison = keystone.list( 'Comparison' );

function createPhase( phase,
                      done ){
  var doc = new Phase.model( phase );
  doc.save( function( err ){
    if( err ){
      console.error( "Error adding phase '" + phase.label + "' to the database:" );
      console.error( err );
    } else {
      console.log( "Added phase '" + phase.label + "' to the database." );
    }
    done();
  } );
}

exports = module.exports = function( done ){
  async.eachSeries( constants.phases, createPhase, done );
};
