'use strict';

const P = require( 'bluebird' );
const keystone = require( 'keystone' );
const _ = require( 'lodash' );

const constants = require( "../models/helpers/constants" );
const Phase = keystone.list( 'Phase' );

function upsertPhase( phase ){
  return Phase.model
    .find( { slug: phase.slug } )
    .exec()
    .then( function( existing ){
      let doc, action;
      if( existing && existing.length ){
        doc = existing[ 0 ];
        _.forEach( phase, function( val,
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
      return doc.save()
        .then( function(){
          console.log( action.b + " phase '" + phase.label + "' in the database." );
        } )
        .catch( function( err ){
          console.error( "Error " + action.a + " phase '" + phase.label + "' in the database:" );
          console.error( err );
        } );
    } );
}

module.exports.init = function(){
  keystone.pre( 'updates', function( done ){
    P.mapSeries( constants.phases, upsertPhase )
      .asCallback( done );
  } );
};
