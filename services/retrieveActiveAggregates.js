'use strict';
var _ = require( 'underscore' );
var keystone = require( 'keystone' );
var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );
var Phase = keystone.list( 'Phase' );

module.exports = function retrieveActiveAggregates(vo, next){
  var promise, aggregate={};

  function getActiveComparison(){
    //console.log( 'getActiveComparison' );
    return Comparison.model
      .find( {
        assessor : vo.assessor
      } )
      .where( 'phase' ).ne( null )
      .populate( 'assessment' )
      .exec();
  }

  function selectComparison( comparisons ){
    //console.log( 'selectComparison' );
    if( comparisons && comparisons.length > 0 ){
      var comparison = aggregate.comparison = comparisons[0];
      aggregate.assessment = comparison.assessment;
      return getPhases();
    }else{
      promise.fulfill();
    }
  }

  function getPhases(){
    //console.log( 'getPhases' );
    return Phase.model
      .find()
      .where( '_id' ).in( aggregate.assessment.phases )
      .exec()
      .then( function( docs ){
        aggregate.phases = docs;
      } )
      .then( getJudgements );
  }

  function getJudgements(){
    //console.log( 'getJudgements' );
    return Judgement.model
      .find()
      .where( 'comparison', aggregate.comparison )
      .populate( 'representation' )
      .exec()
      .then( assembleAggregate );
  }

  function assembleAggregate( judgements ){
    //console.log( 'assembleAggregate' );
    aggregate.judgements = judgements;
    aggregate.representations = _.pluck( judgements, "representation" );
    promise.fulfill();
  }

  promise = getActiveComparison()
    .then( selectComparison )
    .onResolve( function( err ){
      if( err ){
        return next( err );
      }
      next(null, [aggregate] );
    } );

};
