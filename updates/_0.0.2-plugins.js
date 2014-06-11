'use strict';
var keystone = require( 'keystone' ),
    _ = require( 'underscore' ),
    async = require( 'async' );
var random = require('mongoose-random');

var lists = [
    'User',
    'Assessment',
    'Assessee',
    'Comparison',
    'Judgement',
    'Representation'
];



exports = module.exports = function( done ){
  lists.forEach(function(listName){
    var list  = keystone.list(listName);
    list.schema.plugin(random(), { path: '_r' });
  });
  done();
};