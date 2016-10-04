'use strict';

const P = require('bluebird');
var _ = require('lodash');
var keystone = require('keystone');
var algorithm = require('positioned-comparative-selection');

var statsService = require('../services/stats');
var representationsService = require('../services/representations');
const assessmentsService = require('../services/assessments');

const extractMiddleBox = require('./helpers/extractMiddleBox');
const handleHook = require('./helpers/handleHook');

function recalculateMiddleBox(assessment) {
  return representationsService.list({
    rankType: "ranked"
  })
    .then(function sortByAbility(rankedRepresentations) {
      return _.sortBy(rankedRepresentations, (representation)=> {
        return representation.ability.value;
      });
    })
    .then(function (sortedRankedRepresentations) {
      return extractMiddleBox(sortedRankedRepresentations, assessment.middleBoxSize);
    })
    .mapSeries(function (representation) {
      representation.middleBox = true;
      return representation.save();
    })
    ;
}

function assessmentSaved(assessment){
  if(! assessment.actions.calculateMiddleBox){
    return P.resolve();
  }
  return recalculateMiddleBox(assessment)
    .then(function(){
      assessment.actions.calculateMiddleBox=false;
      return assessment;
    });
}

function comparisonSelectionChanged( comparison, diff, done ) {
  return assessmentsService.retrieve({
    _id: comparison.assessment
  })
    .then(function (assessment) {
      //TODO: we need to extract this out here, and move it to the positioned algorithm, with a hook or something
      if (assessment.algorithm === 'positioned-comparative-selection') {
        return statsService.estimateForAssessment( assessment.id );
      }
    })
    .asCallback(done);
}

module.exports.init = function () {
  keystone.list('Assessment').schema.pre('save', handleHook(assessmentSaved));
  keystone.list( 'Comparison' ).events.on( 'change:data.selection', comparisonSelectionChanged );
};
