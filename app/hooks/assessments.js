'use strict';
const debug = require("debug")("dpac:hooks.assessments");

const _ = require('lodash');
const P = require('bluebird');
//const scheduler = require('node-schedule');
const keystone = require('keystone');
const moment = require('moment');

const assessmentsService = require('../services/assessments');
const Assessment = assessmentsService.collection;

const representationsService = require('../services/representations');
const Representation = representationsService.collection;

const usersService = require('../services/users');
const User = usersService.collection;

const comparisonsService = require('../services/comparisons');
const Comparison = comparisonsService.collection;

const statsService = require('../services/stats');
const Stat = statsService.collection;
const constants = require('../models/helpers/constants');


function calculateStats(assessmentId) {
  return statsService.calculateForAssessmentId(assessmentId);
}

function calculateStatsForScheduled() {
  const now = moment();
  return assessmentsService.list({
    state: constants.assessmentStates.ACTIVE,
    'feature.results.enabled': true,
    'feature.results.begin': {
      $lte: now.toDate()
    }
  })
  // .then((list)=>list)
    .each(function (assessment) {
      debug('Scheduler: auto-calculating assessment', assessment.name);
      return calculateStats(assessment.id);
    })
    .then((list) => {
      debug(`Auto-calculated ${list.length} assessments`);
    });
}

function updateComparisonsNum(assessmentIds) {
  return P.each(assessmentIds, (assessmentId) => {
    return comparisonsService.count({assessment: assessmentId})
      .then((n) => Assessment.model.update({_id: assessmentId}, {'cache.comparisonsNum': n}))
      .then(() => statsService.setDirty(assessmentId))
      ;
  });
}

function updateRepresentationsNum(assessmentIds) {
  return P.each(assessmentIds, (assessmentId) => {
    return representationsService.countToRanks({assessment: assessmentId})
      .then((n) => Assessment.model.update({_id: assessmentId}, {'cache.representationsNum': n}))
      .then(() => statsService.setDirty(assessmentId))
      ;
  });
}

function updateAssessorsNum(assessmentIds) {
  return P.each(assessmentIds, (assessmentId) => {
    return usersService.countInAssessment('assessor', assessmentId)
      .then((n) => Assessment.model.update({_id: assessmentId}, {'cache.assessorsNum': n}))
      .then(() => statsService.setDirty(assessmentId))
      ;
  });
}

module.exports.init = function () {
  keystone.post('updates', function (done) {
    calculateStatsForScheduled();
    done();//call immediately, we don't want to wait on this!
  });

  Comparison.events.on('changed:assessment',
    (comparison) => updateComparisonsNum([comparison.assessment]));
  Comparison.events.on('changed:data.selection',
    comparison => statsService.setDirty(comparison.assessment));
  Comparison.schema.post('remove',
    (comparison) => updateComparisonsNum([comparison.assessment]));

  Representation.events.on('changed:assessment',
    (representation) => updateRepresentationsNum([representation.assessment]));
  Representation.events.on('changed:rankType',
    (representation) => updateRepresentationsNum([representation.assessment]));
  Representation.schema.post('remove',
    (representation) => updateRepresentationsNum([representation.assessment]));

  User.events.on('changed:assessments.assessor',
    (user, diff) => updateAssessorsNum(_.xor(diff.original, diff.updated)));
  User.schema.post('remove',
    (user) => updateAssessorsNum(user.assessments.assessor || []));

};
