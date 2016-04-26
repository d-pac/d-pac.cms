'use strict';

var P = require( 'bluebird' );
var _ = require( 'lodash' );
var base = require( './base' );
var assert = require( 'assert' );

var REPRESENTATIONS_NUM_DEFAULT = 10;

module.exports.create = function( env,
                                  opts ){
  var data;
  opts = _.defaults( {}, opts, {
    name: 'peer assessment',
    algorithm: 'comparative-selection',
    representationsNum: REPRESENTATIONS_NUM_DEFAULT,
    documentsNum: REPRESENTATIONS_NUM_DEFAULT,
    assessorsNum: REPRESENTATIONS_NUM_DEFAULT
  } );
  return base.create( env, opts )
    .then( function( basedata ){
      data = basedata;
    } )
    .then( function(){
      return P.each( data.documents, function( document, i ){
        var assessee = data.assessors[ i ];
        document.owner = assessee.id;
        return P.promisify( document.save, document )();
      } );
    } )
    .then( function(){
      return env.services.representations.create( _.times( opts.representationsNum, function( i ){
        var document = data.documents[ i ];
        return {
          name: i,
          title: i,
          assessment: data.assessment.id,
          document: document.id
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
    } )
};
