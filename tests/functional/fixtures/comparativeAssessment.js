'use strict';

var P = require( 'bluebird' );
var _ = require( 'lodash' );
var base = require( './base' );
var assert = require( 'assert' );

var REPRESENTATIONS_NUM = 5;

module.exports.create = function( env ){
  var data;
  return base.create( env, {
      name: 'comparative assessment',
      algorithm: 'comparative-selection'
    } )
    .then( function( basedata ){
      data = basedata;
    } )
    .then( function(){
      return env.services.representations.create( _.times( REPRESENTATIONS_NUM, function( i ){
        return {
          name: i,
          title: i,
          assessment: data.assessment.id,
          document: data.document.id
        };
      } ) );
    } )
    .then(function(representations){
      data.representations = representations;
    })
    .then(function(){
      assert( data.representations, 'Representations not created' );
      assert.equal( data.representations.length, REPRESENTATIONS_NUM, 'Representations not/incorrectly created' );

      return data;
    })
    .catch( function( err ){
      console.log( err );
    } )
};
