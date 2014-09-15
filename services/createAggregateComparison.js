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
    opts.judgements.push( judgement );
    judgement.save( function( err,
                              judgement ){
      if( err ){
        return done( err );
      }

      done( null, judgement );
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
    comparison.save( function( err,
                               comparison ){
      if( err ){
        return done( err );
      }
      done( null, comparison );
    } );
  };
}

/**
 *
 * @param aggregate
 * @param aggregate.assessor
 * @param aggregate.assessment
 * @param aggregate.representations[]
 * @param next
 */
module.exports = function createAggregateComparison( aggregate,
                                                     next ){

  debug( 'createAggregateComparison', aggregate );
  aggregate.judgements = [];
  var tasks = [createComparisonTask( aggregate )].concat( createJudgementTasks( aggregate ) );

  async.series( tasks, function( err,
                                 results ){
    if( err ){
      return next( err );
    }

    if( !_.isArray( results ) || results.length < 1 ){
      return next( new Error( 'Could not create aggregate' ) );
    }

    return next(null, aggregate);
  } );

};
