'use strict';

const keystone = require("keystone");
const representationsService = require('../../services/representations');
const feedbackService = require('../../services/feedback');

module.exports = function (req,
                           res) {
  const view = new keystone.View(req, res);
  const locals = res.locals;
  locals.section = 'feedback';
  locals.data = {
  };
  const user = req.user;

  const q = {
    assessment: req.params.assessmentId,
  };

  if(user.isPamFor(q.assessment)){
    view.on("init", next =>{
      representationsService.list(q)
        .then(representations=>{
          locals.data.representationsById = JSON.parse(JSON.stringify(representations))
            .reduce((memo,r)=>{
              memo[r._id] = r;
              return memo;
            }, {});
          const ids = representations.map(r=>r.id);
          return feedbackService.listLeanByRepresentations({}, ids);
        })
        .reduce((memo,feedbackItem)=>{
          console.log(feedbackItem);
          if(!memo[feedbackItem.representation]){
            memo[feedbackItem.representation] = [];
          }
          memo[feedbackItem.representation].push(feedbackItem);
          return memo;
        }, {})
        .then(feedbackbyRepresentation=>{
          locals.data.feedbackByRepresentation = feedbackbyRepresentation;
        })
        .asCallback(next)
      ;
    });
  }

  view.render('feedback');
};
