'use strict';
var _ = require( 'underscore' );
var debug = require( 'debug' )( 'dpac:services' );
var async = require( 'async' ),
  keystone = require( 'keystone' );
var Assessment = keystone.list( 'Assessment' );
var Representation = keystone.list( 'Representation' );
var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );
var Phase = keystone.list( 'Phase' );

function retrieveAssessment( opts,
                             model ){
  return Assessment.model
    .findById( opts.assessment )
    .exec()
    .then( function( assessment ){
      return model.assessment = assessment;
    } );
}

function retrieveRepresentations( opts,
                                  model ){

  //todo: replace this with CJ
  var promise = Representation.model
    .find()
    .sort( { createdAt : -1 } )
    .limit( 2 )
    .exec()
    .then( function( representations ){
      if( representations && representations.length > 0 ){
        return model.representations = representations;
      }else{
        promise.fulfill();
      }
    } );

  return promise;
}

function createComparison( opts,
                           model ){
  return Comparison.model
    .create( opts )
    .then( function( doc ){
      return model.comparison = doc;
    } );
}

function createJudgements( opts,
                           model ){
  var judgements = [];
  _.each( opts.representations, function( representation ){
    judgements.push( {
      assessor       : opts.assessor,
      assessment     : opts.assessment,
      comparison     : opts.comparison,
      representation : representation
    } );
  } );
  return Judgement.model
    .create( judgements )
    .then( function(){
      return model.judgements = _.toArray( arguments );
    } );
}

function retrievePhases( opts,
                         model ){
  return Phase.model
    .find()
    .where( '_id' ).in( opts.ids )
    .exec()
    .then( function( docs ){
      return model.phases = docs;
    } );
}

/**
 *
 * @param opts
 * @param opts.assessor
 * @param opts.assessment
 * @param next
 */

module.exports = function createAggregate( opts,
                                           next ){
  console.log( 'createAggregate', opts );
  var aggregate = {};
  var promise = retrieveAssessment( {
    assessment : opts.assessment
  }, aggregate )
    .then( function(){
      return retrieveRepresentations( {},
        aggregate );
    } )
    .then( function(){
      return createComparison( {
        assessor   : opts.assessor,
        assessment : opts.assessment
      }, aggregate );
    } )
    .then( function(){
      return createJudgements( {
        assessor        : opts.assessor,
        assessment      : opts.assessment,
        representations : aggregate.representations,
        comparison      : aggregate.comparison
      }, aggregate );
    } )
    .then( function(){
      return retrievePhases( {
        ids : aggregate.assessment.phases
      }, aggregate );
    } )
    .onResolve( function( err,
                          result ){
      next( err, aggregate );
    } );

};
