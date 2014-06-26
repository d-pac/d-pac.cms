'use strict';

var async = require( 'async' ),
    keystone = require( 'keystone' );
var _ = require( 'underscore' );

var judgements = require( './judgements' );

var Comparison = keystone.list( 'Comparison' );

exports.create = function( done,
                           values ){
  var model = new Comparison.model( values );
  
  model.save( function( err ){
    if( err ){
      console.error( "Error adding a comparison to the database:" );
      console.error( err );
    }else{
      console.log( "Added comparison " + model.id + " to the database." );
    }
    done(model, judgements);
  } );
};



