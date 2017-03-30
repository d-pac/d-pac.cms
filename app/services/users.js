"use strict";

const keystone = require("keystone");
const _ = require("lodash");
const debug = require("debug")("dpac:services.users");
const collection = keystone.list("User");
const Service = require("./helpers/Service");
const assessmentsService = require("./assessments");
const comparisonsService = require("./comparisons");
const notesService = require('./notes');
const constants = require('../models/helpers/constants');

const base = new Service(collection);
module.exports = base.mixin();

module.exports.createAnonymous = function registerAnonymous() {
  return assessmentsService.listLean({enableAnonymousLogins: true})
    .then(function (assessments) {
      const assessmentIds = assessments.map(assessment => assessment._id);
      const user = new collection.model({
        name: {first: "first name", last: "last name"},
        email: Date.now() + "@example.com",
        assessments: {
          assessor: assessmentIds
        }
      });
      return user.save();
    })
    .then(function (user) {
      user.name = {first: "Guest", last: user._rid};
      user.email = `guest.${user._rid}@d-pac.be`;
      return user.save();
    });

};

module.exports.listAssessments = function listAssessments(role,
                                                          opts) {
  debug("#listAssessments");
  return this.retrieve(_.defaults({}, opts, {
    fields: (role)
      ? "assessments." + role
      : "assessments"
  }))
    .then(function (user) {
      const ids = _.reduce(user.assessments.toJSON(), function (memo,
                                                                assessmentIds) {
        //no need to filter: duplicate id's get automatically consolidated by mongoose
        return memo.concat(assessmentIds);
      }, []);
      return assessmentsService.listById(ids, {state: {$ne: constants.assessmentStates.ARCHIVED}});
    }).map(function (assessment) {
      assessment = assessment.toJSON({depopulate: true});// necessary, otherwise the added `completedNum` won't stick
      return comparisonsService.completedCount({
        assessment: assessment._id,
        assessor: opts._id
      })
        .then(function (count) {
          assessment.progress = {
            completedNum: count,
            total: _.get(assessment, ['limits', 'comparisonsNum', 'perAssessor'], -1)
          };
          return assessment;
        });
    });
};

module.exports.listIncompleteComparisons = function listIncompleteComparisons(opts) {
  return this.listAssessments('assessor', opts)
    .then(function (assessments) {
      return comparisonsService.listForAssessments({
        assessor: opts._id,
        completed: false
      }, _.map(assessments, '_id'));
    });
};

module.exports.listNotes = function listNotes(opts) {
  return notesService.list({
    author: opts._id
  });
};

module.exports.update = function update(opts) {
  debug("#update");
  return base.update(this.retrieve(opts), opts)
    .exec();
};

module.exports.listForAssessments = function listForAssessments(role,
                                                                assessmentIds) {
  return base.list()
    .exec()
    .filter(function (user) {
      return !!_.find(assessmentIds, function (assessmentId) {
        let found = false;
        if (role === 'assessor' || role === 'both') {
          found = found || user.assessments.assessor.indexOf(assessmentId) > -1;
        }
        if (role === 'assessee' || role === 'both') {
          found = found || user.assessments.assessee.indexOf(assessmentId) > -1;
        }
        return found;
      });
    });
};

module.exports.countInAssessment = function countInAssessment(role,
                                                              assessmentId) {
  return this.listForAssessments(role, [assessmentId])
    .then(function (users) {
      return users.length;
    });
};
