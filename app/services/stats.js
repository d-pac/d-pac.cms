"use strict";
const debug = require("debug")("dpac:services.stats");
const _ = require("lodash");
const P = require('bluebird');

const keystone = require("keystone");
const collection = keystone.list("Stat");
const Service = require("./helpers/Service");
const calculationsService = require('./calculations');
const base = new Service(collection, debug);
module.exports = base.mixin();

module.exports.setDirty = function(assessmentId) {
  return collection.model.update({assessment: assessmentId}, {isUpToDate: false});
};

module.exports.retrieveByAssessmentId = function(assessmentId) {
  return this.list({
    assessment: assessmentId
  })
    .then(function (docs) {
      if(docs.length > 1){
        throw new Error('Should be only one stat doc');
      }

      return docs[0];
    });
};

module.exports.calculateStats = function(statDoc) {
  const assessmentId = statDoc.assessment;
  return calculationsService.estimateForAssessmentId(assessmentId)
    .then(() => calculationsService.statsForAssessmentId(assessmentId))
    .then(function (stats) {
      statDoc.stats = stats;
      statDoc.lastRun = Date.now();
      statDoc.isUpToDate = true;
      return statDoc;
    });
};

module.exports.calculateForAssessmentId = function(assessmentId) {
  return this.retrieveByAssessmentId(assessmentId)
    .then( (statDoc)=>{
      let p;
      if (!statDoc) {
        p = this.create({assessment: assessmentId});
      } else if (statDoc.isUpToDate) {
        return statDoc;
      } else {
        p = P.resolve(statDoc);
      }

      return p.then((statDoc) => module.exports.calculateStats(statDoc))
        .then((statDoc) => statDoc.save().then(() => statDoc));
    });
};
