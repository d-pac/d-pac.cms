'use strict';

const _ = require('lodash');
const keystone = require('keystone');
const async = require('async');
const debug = require("debug")("dpac:services.calculations");
const estimate = require('estimating-rasch-model');
const P = require('bluebird');
const diff = require('deep-diff').diff;
const usersService = require('./users');
const comparisonsService = require('./comparisons');
const representationsService = require('./representations');
const timelogsService = require('./timelogs');

const fns = require('d-pac.functions');

const getAbility = _.partialRight(_.get, ['ability', 'value']);
const getSE = _.partialRight(_.get, ['ability', 'se']);
const getReliability = fns.pm.reliabilityFunctor(getAbility, getSE);

module.exports = {
  estimate: function (representations,
                      comparisons) {
    debug("#estimate");
    let representationDocs, representationObjs;
    let comparisonDocs, comparisonObjs;
    if (_.isArray(representations)) {
      representationDocs = representations;
      representationObjs = JSON.parse(JSON.stringify(representationDocs));
    } else {
      representationDocs = representations.documents;
      representationObjs = representations.objects;
    }

    if (_.isArray(comparisons)) {
      comparisonDocs = comparisons;
      comparisonObjs = JSON.parse(JSON.stringify(comparisonDocs));
    } else {
      comparisonDocs = comparisons.documents;
      comparisonObjs = comparisons.objects;
    }

    let succeed;
    const promise = new P(function (resolve/*,
                                     reject*/) {
      succeed = resolve;
    });

    setTimeout(function () {
      try {
        estimate.estimateCJ(comparisonObjs, representationObjs);
      } catch (err) {
        console.log(err, err.stack);
        //return fail( err );
      }
      const toRanks = _.filter(representationObjs, function (representation) {
        return representation.rankType === "to rank";
      });

      const saveQueue = [];

      _.forEach(toRanks, function (representationObj) {
        const doc = _.find(representationDocs, function (representationDoc) {
          return representationDoc.id.toString() === representationObj._id;
        });
        const diffObj = diff(JSON.parse(JSON.stringify(doc.ability)), representationObj.ability);
        if (diffObj) {
          console.log("Differences for", representationObj.name, ":", diffObj);
          _.forEach(representationObj.ability, function (value,
                                                         key) {
            const v = representationObj.ability[key];
            if (!isNaN(v)) {
              doc.ability[key] = v;
            }
          });
          saveQueue.push(doc);
        }
      });

      async.eachSeries(saveQueue, function (representation,
                                            next) {
        representation.save(next);
      }, function (err) {
        if (err) {
          console.log(err);
          //return fail( err );
        }
        //console.log( "Updated representations:", saveQueue.length );
        succeed(saveQueue);
      });
    }, 500);

    return promise;
  },

  estimateForAssessmentId: function (assessmentId) {
    debug("#estimateForAssessmentId", assessmentId);
    const getComparisons = keystone.list("Comparison").model.find({assessment: assessmentId});
    const getRepresentations = keystone.list("Representation").model.find({assessment: assessmentId});

    const self = this;
    return P.join(getComparisons.exec(), getRepresentations.exec(), function (comparisonDocs,
                                                                              representationDocs) {
      return self.estimate(representationDocs, comparisonDocs);
    });
  },

  statsForAssessmentId: function (assessmentId) {
    return P.props({
      assessors: usersService.listForAssessments('assessor', [assessmentId]),
      comparisons: comparisonsService.listForAssessments({}, [assessmentId]),
      toRankRepresentations: representationsService.list({
        assessment: assessmentId,
        rankType: "to rank"
      })
    })
      .then(function (docs) {
        docs.timelogs = timelogsService.listForComparisonIds(_.map(docs.comparisons, '_id'));
        return P.props(docs);
      })
      .then(function (docs) {
        const r = getReliability(docs.toRankRepresentations);
        const totals = {
          reliability: (!isNaN(r)) ? r : null,
          assessorsNum: docs.assessors.length,
          comparisonsNum: docs.comparisons.length,
          representationsNum: docs.toRankRepresentations.length,
          duration: _.reduce(docs.timelogs, function (memo,
                                                      timelog) {
            return memo + timelog.duration;
          }, 0)
        };
        const byRepresentation = _.reduce(docs.comparisons, function (memo,
                                                                      comparison) {
          const aId = comparison.representations.a.toString();
          const bId = comparison.representations.b.toString();
          _.set(memo, [aId, 'comparisonsNum'], _.get(memo, [aId, 'comparisonsNum'], 0) + 1);
          _.set(memo, [bId, 'comparisonsNum'], _.get(memo, [bId, 'comparisonsNum'], 0) + 1);
          return memo;
        }, {});
        const averages = {};
        if (totals.representationsNum > 0) {
          averages.comparisonsPerRepresentation = (totals.comparisonsNum / totals.representationsNum) * 2;
          averages.durationPerRepresentation = totals.duration / totals.representationsNum;
        }
        if (totals.assessorsNum > 0) {
          averages.comparisonsPerAssessor = totals.comparisonsNum / totals.assessorsNum;
          averages.durationPerAssessor = totals.duration / totals.assessorsNum;
        }
        return {
          totals: totals,
          averages: averages,
          byRepresentation: byRepresentation
        };
      });
  },
};
