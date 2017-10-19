'use strict';

const _ = require('lodash');
const keystone = require('keystone');
const debug = require("debug")("dpac:services.calculations");
const rasch = require('estimating-rasch-model');
const P = require('bluebird');
const usersService = require('./users');
const comparisonsService = require('./comparisons');
const representationsService = require('./representations');
const timelogsService = require('./timelogs');
const misfits = require('d-pac.misfits');
const comparisonMisfitAccessor = require('./helpers/comparisonMisfitAccessor');

const fns = require('d-pac.functions');

const getAbility = _.partialRight(_.get, ['ability', 'value']);
const getSE = _.partialRight(_.get, ['ability', 'se']);
const getReliability = fns.pm.reliabilityFunctor(getAbility, getSE);

function getInfit(item) {
  return item.infit;
}

function setInfit(item, infit) {
  item.rawInfit = item.infit;
  item.infit = infit;
  return item;
}

module.exports = {
  estimate: function (representations,
                      comparisons) {
    debug("#estimate");

    const representationsMap = {
      docs: {},
      vos: {}
    };

    representations.reduce((memo, r) => {
      memo.docs[r.id] = r;
      memo.vos[r.id] = r.toVO();
      return memo;
    }, representationsMap);

    return P.try(() => rasch.estimate({
      items: representationsMap.vos,
      comparisons: comparisons.map(comparisonsService.collection.toVO)
    }))
      .then(function (estimatesMap) {
        return _.map(estimatesMap, (estimate) => {
          const representation = representationsMap.docs[estimate.id];
          representation.ability.value = estimate.ability;
          representation.ability.se = estimate.se;
          return representation;
        });
      })
      .mapSeries((representation) => representation.save())
      .catch(function (err) {
        console.error(err);
      });
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
      comparisons: comparisonsService.listLean({assessment: assessmentId, 'data.selection': {$ne: null}}),
      representations: representationsService.listLean({
        assessment: assessmentId
      })
    })
      .then(function retrieveParticipatoryAssessors(docs) {
        const assessorIds = _.groupBy(docs.comparisons, (comparison) => comparison.assessor);
        docs.assessors = usersService.listById(_.keys(assessorIds));
        return P.props(docs);
      })
      .then(function retrieveTimelogs(docs) {
        docs.timelogs = timelogsService.listForComparisonIds(_.map(docs.comparisons, '_id'));
        return P.props(docs);
      })
      .then(function calculateStats(docs) {
        const representationsByID = docs.representations.reduce((m, r) => {
          m[r._id.toString()] = r;
          return m;
        }, {});

        const toRanks = docs.representations.filter((r) => r.rankType === "to rank");
        const r = getReliability(toRanks);
        const a = new comparisonMisfitAccessor(representationsByID);
        let aggregated = misfits(docs.comparisons, a);
        fns.stat.standardize(_.values(aggregated.byRepresentation), getInfit, setInfit);
        fns.stat.standardize(_.values(aggregated.byAssessor), getInfit, setInfit);
        aggregated.totals = {
          reliability: (!isNaN(r)) ? r : null,
          participatoryAssessorsNum: docs.assessors.length,
          completedComparisonsNum: docs.comparisons.length,
          toRankRepresentationsNum: toRanks.length,
          duration: _.reduce(docs.timelogs, function (memo,
                                                      timelog) {
            return memo + timelog.duration;
          }, 0)
        };

        docs.comparisons.forEach(function (comparison) {
          const memo = aggregated;
          const aId = comparison.representations.a;
          const bId = comparison.representations.b;
          _.set(memo, ['byRepresentation', aId, 'comparisonsNum'], _.get(memo, ['byRepresentation', aId, 'comparisonsNum'], 0) + 1);
          _.set(memo, ['byRepresentation', bId, 'comparisonsNum'], _.get(memo, ['byRepresentation', bId, 'comparisonsNum'], 0) + 1);
          _.set(memo, ['byAssessor', comparison.assessor, 'comparisonsNum'], _.get(memo, ['byAssessor', comparison.assessor, 'comparisonsNum'], 0) + 1);
          return memo;
        });
        aggregated.averages = {};
        if (docs.representations.length > 0) {
          aggregated.averages.comparisonsPerRepresentation = (aggregated.totals.completedComparisonsNum / docs.representations.length) * 2;
          aggregated.averages.durationPerRepresentation = aggregated.totals.duration / docs.representations.length;
        }
        if (aggregated.totals.participatoryAssessorsNum > 0) {
          aggregated.averages.comparisonsPerAssessor = aggregated.totals.completedComparisonsNum / aggregated.totals.participatoryAssessorsNum;
          aggregated.averages.durationPerAssessor = aggregated.totals.duration / aggregated.totals.participatoryAssessorsNum;
        }
        return aggregated;
      });
  },
};
