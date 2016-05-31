'use strict';

var _ = require( 'lodash' );
var base = require( './base' );
var assert = require( 'assert' );

var REPRESENTATIONS_NUM_DEFAULT = 5;

module.exports.create = function( env,
                                  opts ){
  var data;
  opts = _.defaults( {}, opts, {
    name: 'comparative assessment',
    algorithm: 'comparative-selection',
    representationsNum: REPRESENTATIONS_NUM_DEFAULT
  } );
  return base.create( env, opts)
    .then( function( basedata ){
      data = basedata;
    } )
    .then( function(){
      var documentId = data.documents[0].id;
      return env.services.representations.create( _.times( opts.representationsNum, function( i ){
        return {
          name: i,
          title: i,
          assessment: data.assessment.id,
          document: documentId
        };
      } ) );
    } )
    .then( function( representations ){
      data.representations = representations;
    } )
    .then( function(){
      assert( data.representations, 'Representations not created' );
      assert.equal( data.representations.length, opts.representationsNum, 'Representations not/incorrectly created' );

      return data;
    } )
    .catch( function( err ){
      console.log( err );
    } );
};
