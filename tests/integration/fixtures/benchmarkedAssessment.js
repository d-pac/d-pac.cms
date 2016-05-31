'use strict';

var P = require( 'bluebird' );
var _ = require( 'lodash' );
var assert = require( 'assert' );
var base = require( './base' );

var mockRepresentations = require( './benchmarkedAssessmentData.json' );

module.exports.create = function( env ){
  var data;
  return base.create( env, {
      name: 'benchmarked assessment',
      algorithm: 'benchmarked-comparative-selection'
    } )
    .then( function( basedata ){
      data = basedata;
    } )
    .then( function(){
      var Representation = env.app.list( 'Representation' );
      var dependents = [];
      var representationsByFilename = {};
      var representations = _.map( mockRepresentations, function( item ){
        var doc = new Representation.model( {
          name: item.fileName,
          title: item.fileName,
          assessment: data.assessment.id,
          ability: item.ability,
          rankType: item.rankType,
          closeTo: null,
          document: data.document.id
        } );
        representationsByFilename[ item.fileName ] = doc;
        if( item.closeTo ){
          dependents.push( {
            doc: doc,
            item: item
          } );
        }
        return doc;
      } );
      _.each( dependents, function( dependent ){
        dependent.doc.closeTo = representationsByFilename[ dependent.item.closeTo ].id;
      } );
      return P.map( representations, function( doc ){
        return P.promisify( doc.save, doc )();
      } );
    } )
    .then( function( representations ){
      data.representations = representations;
    } )
    .then( function(){
      assert( data.representations, 'Representations not created' );
      assert.equal( data.representations.length, mockRepresentations.length, 'Representations not/incorrectly created' );

      return data;
    } );
};
