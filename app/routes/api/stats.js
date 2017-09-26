'use strict';
const errors = require('errors');
const service = require("../../services/stats");
const assessmentsService = require('../../services/assessments');
const Controller = require("./helpers/Controller");
const base = new Controller(service);


const queries = {
  progress: function () {

  }
};

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
  const q = req.query.q;
  const p = calculateStats(assessmentId);
  if (q) {
    const f = queries[q];
    if (f) {
      p.then(f);
    }
  }
  base.handleResult(p, res, next);
};
