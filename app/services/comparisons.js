"use strict";
const debug = require("debug")("dpac:services.comparisons");
const keystone = require("keystone");
const _ = require("lodash");
const P = require("bluebird");
const benchmark = require('../lib/benchmark');

const collection = keystone.list("Comparison");
const Service = require("./helpers/Service");
const assessmentsService = require('./assessments');
const representationsService = require('./representations');

const base = new Service(collection, debug);
module.exports = base.mixin();

module.exports.listPopulated = (opts) => {
  return base.list(opts)
    .populate('representations.a representations.b')
    .exec();
};

module.exports.listLean = (opts) => {
  return base.list(opts)
    .lean()
    .exec();
};

module.exports.completedCount = function completedCount(opts) {
  debug("#completedCount");
  opts = _.defaults(opts, {
    completed: true
  });

  return base.count(opts).exec();
};

module.exports.listForAssessments = function listForAssessments(opts,
                                                                assessmentIds) {
  debug("#listForAssessments", opts, assessmentIds);
  return base.list(opts)
    .where("assessment").in(assessmentIds)
    .exec();
};

module.exports.listForRepresentation = function listForRepresentation(representation) {
  //return base.list({})
  //  .where( { "representations.a": representation.id } )
  //  //.or( [ { "representations.b": representation.id } ] )
  //  .exec();
  return base.list({
    $or: [
      {"representations.a": representation.id},
      {"representations.b": representation.id}
    ]
  }).exec();
};

module.exports.create = function (opts) {
  debug('#create', opts);
  const b = benchmark(true, keystone.get('dev env'));
  const memo = {
    representations: null,
    comparisons: null,
    assessment: null
  };
  return representationsService.listWithoutUser(opts.assessor.id, {
    assessment: opts.assessment
  })
    .then((representations) => {
      b.snap('retrieved representations');
      if (representations.length < 2) {
        throw new Error('assessment-incorrectly-configured');
      }
      memo.representations = representations;
      return null;
    })
    .then(() => {
      //retrieve comparisons
      return this.listLean({
        assessment: opts.assessment
      });
    })
    .then((comparisons) => {
      b.snap('retrieved comparisons');
      memo.comparisons = comparisons;
    })
    .then(() => {
      //retrieve assessment
      return assessmentsService.retrieve({
        _id: opts.assessment
      });
    })
    .then((assessment) => {
      b.snap('retrieved assessment');
      memo.assessment = assessment;
      return memo;
    })
    .then(function (results) {
        const representations = results.representations;
        const comparisons = results.comparisons;
        const assessment = results.assessment;
        let data;
        try {
          data = require(assessment.algorithm).select({
            items: representations.map(representationsService.collection.toVO),
            comparisons: comparisons.map(collection.toVO),
            options: assessment.toVO(),
            user: {id: opts.assessor.id}
          });
        } catch (error) {
          console.log(error);
          throw new Error('assessment-incorrectly-configured');
        }
        b.snap('selected representations pair');
        let p;

        if (data && !data.messages) {
          p = base.create({
            assessment: opts.assessment,
            assessor: opts.assessor._id,
            phase: assessment.phases[0],
            representations: {
              a: data.a,
              b: data.b
            }
          })
            .then(function (comparison) {
              b.snap('created comparison');

              //we have lean docs, so we need to retrieve the full ones
              return P.props({
                a: representationsService.retrieve({_id: data.a}),
                b: representationsService.retrieve({_id: data.b}),
                comparison: comparison
              });
            })
            .then(function (aggregate) {
              b.snap('retrieved selected representations');
              aggregate.comparison.representations.a = aggregate.a;
              aggregate.comparison.representations.b = aggregate.b;
              return aggregate.comparison;
            });
        } else if (data.messages) {
          data.type = "messages";
          p = P.resolve(data);
        }
        return p;
      }
    );
};

module.exports.listRepresentationsForComparisons = function (comparisons) {
  const ids = _.reduce(comparisons, function (memo,
                                              comparison) {
    return memo.concat(_.values(_.pick(comparison.representations, "a", "b", "c", "d")));
  }, []);
  return representationsService.listById(ids);
};
