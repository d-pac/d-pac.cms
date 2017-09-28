'use strict';

const _ = require('lodash');
const keystone = require('keystone');
const async = require('async');
const debug = require("debug")("dpac:services.calculations");
const rasch = require('estimating-rasch-model');
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

/**
 *
 * @param {Object[]} representation
 * @param {string} representation._id - id of the item
 * @param {string} representation.ranktype - ["ranked", "to rank", "benchmark"]
 * @param {Object} [representation.ability]
 * @param {number} [representation.ability.value] - the ability
 * @param {number} [representation.ability.se] - the standard error
 */
function convertRepresentation(representation) {
  return {
    id: representation._id,
    ability: _.get(representation, ["ability", "value"], null),
    se: _.get(representation, ["ability", "se"], null),
    ranked: (representation.rankType !== "to rank")
  };
}

/**
 *
 * @param {Object} comparison
 * @param {Object} comparison.data
 * @param {string} comparison.data.selection - ID of the selected item
 * @param {Object} comparison.representations
 * @param {string} comparison.representations.a - ID for the "A" item
 * @param {string} comparison.representations.b - ID for the "B" item
 */
function convertComparison(comparison) {
  return {
    selected: _.get(comparison, ["data", "selection"], null),
    itemA: comparison.representations.a,
    itemB: comparison.representations.b
  };
}

module.exports = {
  estimate: function (representations,
                      comparisons) {
    debug("#estimate");

    const lookup = {
      representationVOs: {},
      representationDocs: {}
    };
    representations.forEach((doc) => {
      const obj = convertRepresentation(JSON.parse(JSON.stringify(doc)));
      lookup.representationDocs[obj.id] = doc;
      lookup.representationVOs[obj.id] = obj;
    });

    const comparisonVOs = JSON.parse(JSON.stringify(comparisons)).map(convertComparison);

    return P.try(() => rasch.estimate(comparisonVOs, lookup.representationVOs))
      .then(function (estimatesMap) {
        return _.map(estimatesMap, (estimate) => {
          const representation = lookup.representationDocs[estimate.id];
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
      comparisons: comparisonsService.listLean({assessment:assessmentId, 'data.selection': {$ne: null}}),
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
        const toRanks = docs.representations.filter((r)=>r.rankType==="to rank");
        const r = getReliability(toRanks);
        const totals = {
          reliability: (!isNaN(r)) ? r : null,
          participatoryAssessorsNum: docs.assessors.length,
          completedComparisonsNum: docs.comparisons.length,
          toRankRepresentationsNum: toRanks.length,
          duration: _.reduce(docs.timelogs, function (memo,
                                                      timelog) {
            return memo + timelog.duration;
          }, 0)
        };
        const byRepresentation = _.reduce(docs.comparisons, function (memo,
                                                                      comparison) {
          const aId = comparison.representations.a;
          const bId = comparison.representations.b;
          _.set(memo, [aId, 'comparisonsNum'], _.get(memo, [aId, 'comparisonsNum'], 0) + 1);
          _.set(memo, [bId, 'comparisonsNum'], _.get(memo, [bId, 'comparisonsNum'], 0) + 1);
          return memo;
        }, {});
        const averages = {};
        if (docs.representations.length > 0) {
          averages.comparisonsPerRepresentation = (totals.completedComparisonsNum / docs.representations.length) * 2;
          averages.durationPerRepresentation = totals.duration / docs.representations.length;
        }
        if (totals.participatoryAssessorsNum > 0) {
          averages.comparisonsPerAssessor = totals.completedComparisonsNum / totals.participatoryAssessorsNum;
          averages.durationPerAssessor = totals.duration / totals.participatoryAssessorsNum;
        }
        return {
          totals: totals,
          averages: averages,
          byRepresentation: byRepresentation
        };
      });
  },
};
