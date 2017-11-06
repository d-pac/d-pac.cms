"use strict";
const _ = require("lodash");
const keystone = require("keystone");
const Types = keystone.Field.Types;

const constants = require("./helpers/constants");

const format = "DD/MM/YYYY HH:mm:ss";

const Comparison = new keystone.List("Comparison", {
  map: {
    name: "_rid"
  },
  track: true,
  nocreate: !keystone.get('dev env'),
  noedit: false,
  schema: {
    minimize: false
  }
});

Comparison.api = {
  creatable: ["assessment", 'assessor'],
  editable: ['phase', 'data', 'completed']
};

Comparison.toVO = function (docOrObj) {
  const obj = JSON.parse(JSON.stringify(docOrObj));
  return {
    id: obj._id,
    a: obj.representations.a,
    b: obj.representations.b,
    selected: obj.data.selection,
    owner: obj.assessor
  };
};

Comparison.fromVO = function (vo) {
  return {
    _id: vo.id,
    representations: {
      a: vo.a,
      b: vo.b,
    }
  };
};

Comparison.schema.methods.toVO = function () {
  return Comparison.toVO(this);
};

const data = {};

_.forEach(constants.phases, function (phase) {
  data[phase.slug] = phase.field;
});

Comparison.schema.plugin(require("./helpers/autoinc").plugin, {
  model: "Comparison",
  field: "_rid",
  startAt: 1
});

Comparison.schema.plugin(require("mongoose-deep-populate")(keystone.mongoose));

Comparison.defaultColumns = "name, assessor, representations.a, representations.b, createdAt, selectionMadeAt";
require('./helpers/setupList')(Comparison)
  .add("Connections", {

    assessment: {
      type: Types.Relationship,
      ref: "Assessment",
      many: false, // C01
      initial: true,
      required: false, // C01
      index: true
    },

    // todo: filter on, dependsOn assessment
    assessor: {
      type: Types.Relationship,
      ref: "User",
      many: false, // C02
      index: true,
      required: false, // C02
      initial: true
    },

    representations: {
      a: {
        label: "Representation A",
        type: Types.Relationship,
        ref: "Representation",
        initial: true
      },
      b: {
        label: "Representation B",
        type: Types.Relationship,
        ref: "Representation",
        initial: true
      }
    },
  }, "State", {
    phase: {
      type: Types.Relationship,
      ref: "Phase",
      index: true,
      initial: true,
      label: "Current phase"
    },

    selectionMadeAt: {
      type: Types.Datetime,
      format: format,
      noedit: !keystone.get("dev env"),
      watch: "data.selection",
      value: function () {
        return Date.now();
      }
    },
    completed: {
      type: Types.Boolean,
      default: false,
      initial: false
    },

  }, "Assessor data", {
    data: data,
  })
  .emit('assessment', 'data.selection')
  .retain("track")
  .relate({
    path: "timelogs",
    ref: "Timelog",
    refPath: "comparison",
    label: "Timelogs"
  })
  .register();
