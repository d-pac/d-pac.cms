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
    judgement.save( done );
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
      active     : true,
      judgements : []
    } );
    opts.comparison = comparison;
    comparison.save( done );
  };
}

module.exports = function createAggregateComparison( opts ){

  debug( 'createAggregateComparison', opts );
  var tasks = [createComparisonTask( opts )].concat( createJudgementTasks( opts ) );

  async.series( tasks, function( err,
                                 results ){
    console.log( results );
  } );

  //async.series( [
  //  function( cb ){
  //    comparison = new Comparison( {
  //      assessor   : opts.user,
  //      assessment : opts.assessment,
  //      active     : true
  //    } );
  //    comparison.save( cb );
  //  },
  //  function( cb ){
  //  }
  //], function( err,
  //             results ){
  //
  //} );

};
