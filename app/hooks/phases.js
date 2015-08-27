var keystone = require( 'keystone' );
var async = require( 'async' );
var _ = require( 'lodash' );

var constants = require( "../models/helpers/constants" );
var Phase = keystone.list( 'Phase' );
var Comparison = keystone.list( 'Comparison' );

function createPhase( phase,
                      done ){
  Phase.model.find( { slug: phase.slug } ).exec( function( err,
                                                           existing ){
    var doc, action;
    if( existing && existing.length ){
      doc = existing[ 0 ];
      _.each( phase, function( val,
                               key ){
        doc[ key ] = val;
      } );
      action = {
        a: 'updating',
        b: 'Updated'
      };
    } else {
      doc = new Phase.model( phase );
      action = {
        a: 'adding',
        b: 'Added'
      };
    }
    doc.save( function( err ){
      if( err ){
        console.error( "Error " + action.a + " phase '" + phase.label + "' in the database:" );
        console.error( err );
      } else {
        console.log( action.b + " phase '" + phase.label + "' in the database." );
      }
      done();
    } );
  } );
}

module.exports.init = function(){
  keystone.pre( 'updates', function( done ){
    async.eachSeries( constants.phases, createPhase, done );
  } );
};
