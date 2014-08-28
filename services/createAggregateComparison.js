'use strict';
var _ = require( 'underscore' );
var debug = require( 'debug' )( 'dpac:services' );
var async = require( 'async' ),
  keystone = require( 'keystone' );

var Comparison = keystone.list( 'Comparison' );
var Judgement = keystone.list( 'Judgement' );

function createJudgementTask( opts,
                              representation ){
  return function createJudgement( done ){
    var judgement = new Judgement.model( {
      assessor       : opts.assessor,
      assessment     : opts.assessment,
      representation : representation,
      comparison     : opts.comparison
    } );
    opts.judgements.push(judgement);
    judgement.save( function(err, judgement){
      if(err){
        return done(err);
      }

      done(null, judgement);
    } );
  };
}

function createJudgementTasks( opts ){
  var tasks = [];
  _.times( opts.representations.length, function( index ){
    tasks.push( createJudgementTask( opts, opts.representations[index] ) );
  } );
  return tasks;
}

function createComparisonTask( opts ){
  return function createComparison( done ){
    var comparison = new Comparison.model( {
      assessor   : opts.assessor,
      assessment : opts.assessment,
      active     : true
    } );
    opts.comparison = comparison;
    comparison.save( function(err, comparison){
      if(err){
        return done(err);
      }
      done(null, comparison);
    } );
  };
}

module.exports = function createAggregateComparison( opts, next ){

  debug( 'createAggregateComparison', opts );
  opts.judgements = [];
  var tasks = [createComparisonTask( opts )].concat( createJudgementTasks( opts ) );

  async.series( tasks, function( err,
                                 results ){
    var aggregate = opts.comparison.toJSON();
    //aggregate.judgements = opts.judgements;
    console.log(aggregate);
    //done(null, aggregate);
  } );

};
