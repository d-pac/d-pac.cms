'use strict';
const errors = require('errors');
const service = require("../../services/stats");
const assessmentsService = require('../../services/assessments');
const Controller = require("./helpers/Controller");
const base = new Controller(service);
module.exports = base.mixin();

function calculateStats(assessmentId) {
  return assessmentsService.count({_id: assessmentId})
    .then((n) => {
      if (n < 1) {
        throw new errors.Http404Error();
      }
    })
    .then(() => service.calculateForAssessmentId(assessmentId));
}

module.exports.retrieve = function (req, res, next) {

  const assessmentId = req.params.assessmentId;
  base.handleResult(calculateStats(assessmentId), res, next);
};
