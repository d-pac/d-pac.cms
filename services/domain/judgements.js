'use strict';

var async = require( 'async' ),
    keystone = require( 'keystone' );

var Judgement = keystone.list( 'Judgement' );

exports.create = function( values ){
  return new Judgement.model( values );
}


