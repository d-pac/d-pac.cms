'use strict';

var async = require( 'async' ),
    keystone = require( 'keystone' );

var comparisons = require( '../../../services/domain/comparisons' );

//var Comparison = keystone.list('Comparison');
//var Timelog = keystone.list('Timelog');
//var Judgement = keystone.list('Judgement');

exports.create = function( req,
                           res ){
  comparisons.create(function(model, judgements){
    res.send( 200, model );
  },{
    assessor : req.user
  } );
//  var item = new Comparison.model();
//  item.assessor = req.user;
//  //assessor: current user
//
//  //assessment: first assessment in queue
//
//  //timelogs : new timelogs model
//  item.timelogs = [
//      new Timelog.model()
//  ];
//
//  item.judgements = [
//      new Judgement.model()
//  ];
//
  //judgements: 2 new judgements, met representations
};
