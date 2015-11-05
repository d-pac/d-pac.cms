'use strict';

var P = require( 'bluebird' );
var _ = require( 'lodash' );
var assert = require( 'assert' );

var ASSESSORS_NUM = 4;
module.exports.create = function( env,
                                  opts ){
  var data = {};
  return env.services.assessments.create( {
      name: opts.name,
      title: opts.name,
      algorithm: opts.algorithm,
      state: 'published',
      comparisonsNum: {
        perRepresentation: 10,
        perAssessor: [ 5, 17 ]
      }
    } )
    .then( function( doc ){
      data.assessment = doc;
    } )
    .then( function createAssessors(){
      return env.services.users.create( _.times( ASSESSORS_NUM, function( i ){
        return {
          name: {
            first: i.toString(),
            last: i.toString()
          },
          email: i + '@example.com',
          assessments: {
            assessor: [ data.assessment.id ]
          }
        };
      } ) )
    } )
    .then( function( assessors ){
      data.assessors = assessors;
    } )
    .then( function createDocument(){
      return env.services.documents.create( {
        name: 'dummy document',
        link: 'http://example.com/dummy.pdf'
      } )
    } )
    .then( function( doc ){
      data.document = doc;
    } )
    .then( function(){
      assert( data.assessment, 'Assessment not created' );
      assert( data.document, 'Document not created' );
      assert( data.assessors, 'Assessors not created' );
      assert.equal( data.assessors.length, ASSESSORS_NUM, 'Assessors not/incorrectly created' );

      return data;
    } );
};
