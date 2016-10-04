"use strict";

const _ = require('lodash');
var keystone = require("keystone");
var Types = keystone.Field.Types;
var constants = require("./helpers/constants");
var P = require("bluebird");

var assessmentsService = require("../services/assessments");
var documentsService = require("../services/documents");

var Representation = new keystone.List("Representation", {
  track: true
});
Representation.defaultColumns = "name, rankType|120, ability.value|200, ability.se|200, middleBox|40";

Representation.schema.methods.compareWith = function (other) {
  this.compared.push(other._id);
  other.compared.push(this._id);
  return P.all([this.save(), other.save()]);
};

Representation.schema.methods.uncompareWith = function (other) {
  var ti = this.compared.indexOf(other.id);
  this.compared.splice(ti, 1);
  var oi = other.compared.indexOf(this.id);
  other.compared.splice(oi, 1);

  return P.all([this.save(), other.save()]);
};

Representation.schema.methods.reset = function(){
  this.compared = [];
  this.middleBox = false;
  if(this.rankType===constants.TO_RANK){
    this.ability.value = null;
    this.ability.se = null;
  }
};

Representation.api = {
  filterable: [
    'assessment',
    'rankType',
    'closeTo'
  ]
};

require('./helpers/setupList')(Representation)
  .add({
    name: {
      type: String,
      default: "Representation name",
      noedit: true,
      watch: "assessment document",
      value: function (callback) {
        if (this.assessment && this.document) {
          P.join(assessmentsService.retrieve({
            _id: this.assessment
          }), documentsService.retrieve({
            _id: this.document
          }), function (assessment,
                        document) {
            callback(null, assessmentsService.getName(assessment) + " - " + documentsService.getName(document));
          }).catch(function (err) {
            callback(err);
          });
        } else {
          callback(null, "Empty representation");
        }
      },
      required: false,
      note: "is automatically generated"
    },

    title: {
      type: String,
      note: 'Purely for administrative or testing purposes'
    },

    rankType: {
      type: Types.Select,
      options: constants.representationTypes.list.toString(),
      default: constants.TO_RANK,
      index: true,
      watch: "closeTo",
      value: function () {
        if (this.closeTo) {
          return constants.RANKED;
        }
        return this.rankType;
      },
      note: "Automatically set to '" + constants.RANKED + "' if a benchmark is chosen in 'close to'"
    },

  }, "Connections", {

    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      initial: true,
      required: true, // R02
      many: false, // R02
      index: true
    },

    document: {
      type: Types.Relationship,
      ref: "Document",
      initial: true,
      required: true,
      many: false,
      index: true
    },

    closeTo: {
      label: "Close to (becnhmark)",
      note: "Shows representations with rankType 'benchmark' only.",
      type: Types.Relationship,
      ref: "Representation",
      many: false,
      filters: {
        rankType: constants.BENCHMARK
      }
    },

    compared: {
      type: Types.Relationship,
      ref: "Representation",
      many: true,
      noedit: true,
      default: [],
      label: "Compared to"
    },

    middleBox: {
      type: Types.Boolean,
      noedit: true,
      default: false,
      label: "Middlebox"
    }

  }, "Stats", {

    ability: {
      value: {
        type: Types.Number,
        label: "Ability",
        default: null //yes, we _really_ do want `null` here, since this is a two-state field, either with or without a value
      },
      se: {
        type: Types.Number,
        label: "Standard error",
        default: null //yes, we _really_ do want `null` here, since this is a two-state field, either with or without a value
      }
    },

  })
  .emit("assessment", "rankType")
  .validate({
    "ability.value": [
      function () {
        return !(this.rankType === constants.BENCHMARK && this.ability.value === null); //eslint-disable-line no-invalid-this
      }, "Representations of `rankType` 'benchmark' aren't allowed to have ability values of `null`"
    ],
    "ability.se": [
      function () {
        return !(this.rankType === constants.BENCHMARK && this.ability.se === null); //eslint-disable-line no-invalid-this
      }, "Representations of `rankType` 'benchmark' aren't allowed to have ability SE's of `null`"
    ]
  })
  .virtualize({
    comparedNum: {
      get: function () {
        return _.get(this, 'compared', []).length;
      },
      depends: ['compared']
    }
  })
  .retain("track")
  .relate({
      path: "comparisonsA",
      ref: "Comparison",
      refPath: "representations.a",
      label: "Comparisons (A)"
    },
    {
      path: "comparisonsB",
      ref: "Comparison",
      refPath: "representations.b",
      label: "Comparisons (B)"
    })
  .register();
