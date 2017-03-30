'use strict';
const _ = require('lodash');
const P = require('bluebird');
const constants = require('../models/helpers/constants');
const assessmentsService = require('../services/assessments');
const log = _.partial(console.log, require('path').basename(__filename) + ':');

module.exports = function (done) {
  assessmentsService.list({})
    .mapSeries(function (assessment) {
      assessment.feature.uploads.enabled = !!assessment.enableUploads;
      if (assessment.schedule && assessment.schedule.active) {
        if (assessment.schedule.begin) {
          assessment.feature.comparisons.begin = assessment.schedule.begin;
        }
        if (assessment.schedule.end) {
          assessment.feature.comparisons.end = assessment.schedule.end;
        }
      }
      if (assessment.results && typeof assessment.results.enable !== "undefined") {
        assessment.feature.results.enabled = assessment.results.enable;
      }
      if (assessment.state && !(assessment.state === constants.assessmentStates.COMPLETED || assessment.state === constants.assessmentStates.ARCHIVED)) {
        assessment.state = constants.assessmentStates.ACTIVE;
      }

      const modified = assessment.modifiedPaths();
      if (modified.length) {
        return assessment.save().catch((err) => P.reject(err));
      }

      return assessment;
    })
    .then(function (documents) {
      log('Updated', documents.length, 'documents');
      return null;
    })
    .catch((err) => {
      log("Error", err);
      return P.reject(err);
    })
    .asCallback(done);
};
