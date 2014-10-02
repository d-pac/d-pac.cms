'use strict';
var _ = require('underscore');
var keystone = require( 'keystone' );
var Judgement = keystone.list( 'Judgement' );



module.exports.retrieve = function retrieveJudgements( opts ){
  //console.log( 'retrieveJudgements' );
  return Judgement.model
    .find( opts )
    .populate( 'representation' )
    .lean()
    .exec();
};

module.exports.create = function createJudgements( opts ){
  //debug('createJudgements');
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
      //won't be handled correctly in the promise chain, unless if we pass them along here
      return _.toArray( arguments );
    } );
};
