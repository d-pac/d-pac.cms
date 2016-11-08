'use strict';

let algorithm;
try{
  algorithm = require('positioned-comparative-selection');
}catch(err){
  if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
  }
  return;
}


const P = require('bluebird');
var _ = require('lodash');
var keystone = require('keystone');

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
        const getComparisons = keystone.list( "Comparison" ).model.find( { assessment: assessment.id } );
        const getRepresentations = keystone.list( "Representation" ).model.find( { assessment: assessment.id } );

        return P.join( getComparisons.exec(), getRepresentations.exec(), function( comparisonDocs,
                                                                                   representationDocs ){

          // we need to swap the (stale) comparison from the database with the (updated) comparison we received
          // otherwise the estimation will produce incorrect data
          const index = comparisonDocs.findIndex(function (item, i, list) {
            return item._id.equals(comparison._id);
          });
          comparisonDocs.splice(index, 1, comparison);
          return statsService.estimate( representationDocs, comparisonDocs );
        } );
      }
    })
    .asCallback(done);
}

module.exports.init = function () {
  keystone.list('Assessment').schema.pre('save', handleHook(assessmentSaved));
  keystone.list( 'Comparison' ).events.on( 'change:data.selection', comparisonSelectionChanged );
};
