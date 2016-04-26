'use strict';

var P = require( 'bluebird' );
var _ = require( 'lodash' );
var assert = require( 'assert' );

var ASSESSORS_NUM_DEFAULT = 4;
var DOCUMENTS_NUM_DEFAULT = 1;
module.exports.create = function( env,
                                  opts ){
  var data = {};
  opts = _.defaults( {}, opts, {
    assessorsNum: ASSESSORS_NUM_DEFAULT,
    documentsNum: DOCUMENTS_NUM_DEFAULT
  } );
  return env.services.assessments.create( {
    name: opts.name,
    title: opts.name,
    algorithm: opts.algorithm,
    state: 'published',
    comparisons: {
      dimension: 'representation',
      perRepresentation: 10
    }
  } )
    .then( function( doc ){
      data.assessment = doc;
    } )
    .then( function createAssessors(){
      return env.services.users.create( _.times( opts.assessorsNum, function( i ){
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
      } ) );
    } )
    .then( function( assessors ){
      data.assessors = assessors;
    } )
    .then( function createDocument(){
      const docs = _.times( opts.documentsNum, function( i ){
        return {
          name: 'dummy document ' + i,
          link: 'http://example.com/dummy-' + i + '.pdf'
        };
      } );
      return env.services.documents.create(docs);
    } )
    .catch( ( err )=>{
      throw err;
    } )
    .then( function( docs ){
      if( !_.isArray( docs ) ){ //single doc
        docs = [ docs ];
      }
      data.documents = docs;
    } )
    .then( function(){
      assert( data.assessment, 'Assessment not created' );
      assert( data.documents, 'Documents not created' );
      assert.equal( data.documents.length, opts.documentsNum, 'Documents incorrectly created' );
      assert( data.assessors, 'Assessors not created' );
      assert.equal( data.assessors.length, opts.assessorsNum, 'Assessors not/incorrectly created' );

      return data;
    } )

};
