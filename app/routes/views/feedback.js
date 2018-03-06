'use strict';
const P = require('bluebird');
const errors = require('errors');
const keystone = require("keystone");
const representationsService = require('../../services/representations');
const feedbackService = require('../../services/feedback');

module.exports = function (req,
                           res, next) {
  const view = new keystone.View(req, res);
  const locals = res.locals;
  locals.section = 'feedback';
  locals.data = {};
  const user = req.user;

  const q = {
    assessment: req.params.assessmentId,
  };
  if (!user) {
    return next(new errors.Http403Error());
  }

  let p;
  if (user.isPamFor(q.assessment)) {
    p = representationsService.list(q);
  } else if (user.isAssesseeFor(q.assessment)) {
    p = representationsService.listForUser(user.id, q);
  }

  if (!p) {
    return next(new errors.Http403Error());
  }

  view.on("init", next => {

    if (p) {
      p.then(representations => representations.sort((a, b) => parseInt(a.document._rid, 10) - parseInt(b.document._rid, 10)))
        .then(representations => {
          locals.data.representationsList = JSON.parse(JSON.stringify(representations));
          const ids = representations.map(r => r.id);
          return feedbackService.listLeanByRepresentations({}, ids);
        })
        .reduce((memo, feedbackItem) => {
          console.log(feedbackItem);
          if (!memo[feedbackItem.representation]) {
            memo[feedbackItem.representation] = [];
          }
          memo[feedbackItem.representation].push(feedbackItem);
          return memo;
        }, {})
        .then(feedbackbyRepresentation => {
          locals.data.feedbackByRepresentation = feedbackbyRepresentation;
        })
        .asCallback(next);

    }
  });


  view.render('feedback');
};
