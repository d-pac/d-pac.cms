"use strict";

const _ = require('lodash');
const keystone = require("keystone");
const Types = keystone.Field.Types;
const constants = require("./helpers/constants");
const P = require("bluebird");

const Representation = new keystone.List("Representation", {
  track: true
});
Representation.defaultColumns = "name, rankType|120, ability.value|200, ability.se|200, isInComparison|40";

Representation.toVO = function (docOrObj) {
  const obj = (docOrObj.id) ? JSON.parse(JSON.stringify(docOrObj)) : docOrObj;

  return {
    id: obj._id,
    ability: obj.ability.value,
    se: obj.ability.value,
    ranked: obj.rankType !== "to rank",
    middle: obj.middleBox
  };
};

Representation.fromVO = function (vo) {
  return {
    _id: vo.id,
    ability: {
      value: vo.ability,
      se: vo.se
    }
  };
};

Representation.schema.methods.toVO = function () {
  return Representation.toVO(this);
};

Representation.schema.methods.reset = function () {
  // this.middleBox = false;
  if (this.rankType === constants.TO_RANK) {
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
      required: false,
      note: "automatically generated"
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

  }, "Automatic", {
    isInComparison: {
      type: Boolean,
      default: false,
      label: "In comparison",
      note: "Automatically set when this representation is used in a comparison"
    }
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
