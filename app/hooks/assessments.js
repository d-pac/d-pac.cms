'use strict';

const _ = require('lodash');
const P = require('bluebird');
const scheduler = require('node-schedule');
const keystone = require('keystone');

const assessmentsService = require('../services/assessments');
const representationsService = require('../services/representations');
const usersService = require('../services/users');
const comparisonsService = require('../services/comparisons');
const statsService = require('../services/stats');
const constants = require('../models/helpers/constants');


function calculateStats(assessment) {
  return statsService.estimateForAssessment(assessment.id)
    .then(function () {
      return statsService.statsForAssessment(assessment);
    })
    .then(function (stats) {
      assessment.actions.calculate = false;
      assessment.stats = stats;
      assessment.stats.lastRun = Date.now();
      return assessment;
    });
}

function recalculateStats(assessmentId) {
  return assessmentsService.retrieve({_id: assessmentId})
    .then(function (assessment) {
      if (_.get(assessment, ["stats", "lastRun"], false)) {
        return calculateStats(assessment)
          .then(function (assessment) {
            return assessment.save();
          });
      }
      return null;
    });
}

function calculateStatsForScheduled() {
  return assessmentsService.list({
    state: constants.assessmentStates.ACTIVE,
    'feature.results.enabled': true,
    'feature.results.begin': {
      $lte: new Date()
    },
    'stats.lastRun': null
  }).each(function (assessment) {
    console.log('Scheduler: auto-calculating assessment', assessment.name);
    return calculateStats(assessment)
      .then(function (assessment) {
        return assessment.save();
      });
  });
}

function updateComparisonsNum(assessmentIds) {
  return P.each(assessmentIds, (assessmentId) => {
    return comparisonsService.count({
      assessment: assessmentId
    })
      .then((n) => {
        return assessmentsService.collection.model.update({_id: assessmentId}, {'cache.comparisonsNum': n});
      });
  });
}

function updateRepresentationsNum(assessmentIds) {
  return P.each(assessmentIds, (assessmentId) => {
    return representationsService.countToRanks({
      assessment: assessmentId
    })
      .then((n) => {
        return assessmentsService.collection.model.update({_id: assessmentId}, {'cache.representationsNum': n});
      });
  });
}

function updateAssessorsNum(assessmentIds) {
  return P.each(assessmentIds, (assessmentId) => {
    return usersService.countInAssessment('assessor', assessmentId)
      .then((n) => {
        return assessmentsService.collection.model.update({_id: assessmentId}, {'cache.assessorsNum': n});
      });
  });
}

module.exports.init = function () {
  keystone.post('updates', function (done) {
    scheduler.scheduleJob('* * * * *', calculateStatsForScheduled);
    calculateStatsForScheduled();
    done();//call immediately, we don't want to wait on this!
  });

  assessmentsService.collection.events.on('change:actions', (doc,
                                                             diff,
                                                             done) => {
    if (_.get(doc, ['actions', 'calculate'], false)) {
      calculateStats(doc).asCallback(done);
    } else {
      done();
    }
  });

  comparisonsService.collection.events.on('changed:assessment', (comparison) => updateComparisonsNum([comparison.assessment]));
  comparisonsService.collection.events.on('changed:data.selection', comparison => recalculateStats(comparison.assessment));
  comparisonsService.collection.schema.post('remove', (comparison) => updateComparisonsNum([comparison.assessment]));

  representationsService.collection.events.on('changed:assessment', (representation) => updateRepresentationsNum([representation.assessment]));
  representationsService.collection.events.on('changed:rankType', (representation) => updateRepresentationsNum([representation.assessment]));
  representationsService.collection.schema.post('remove', (representation) => updateRepresentationsNum([representation.assessment]));

  usersService.collection.events.on('changed:assessments.assessor', (user,
                                                                     diff) => {
    return updateAssessorsNum(_.xor(diff.original, diff.updated));
  });
  usersService.collection.schema.post('remove', (user) => {
    return updateAssessorsNum(user.assessments.assessor || []);
  });
};
