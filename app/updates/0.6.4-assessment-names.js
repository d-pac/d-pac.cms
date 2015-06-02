"use strict";
var keystone = require( 'keystone' );
var _ = require('underscore');
var async = require('async');
var Assessment = keystone.list( 'Assessment' );
exports = module.exports = function( done ){
  Assessment.model
    .find( {} )
    .exec()
    .then(function(assessments){
      async.eachSeries(assessments, function(assessment, next){
        assessment.name = assessment.comment || assessment.title;
        assessment.save(function(err){
          next(err);
        });
      }, function(err){
        if(err){
          throw err;
        }
      });
    }).then(function(){
      console.log('All assessments updated');
      done();
    }).then(null, done);
};
