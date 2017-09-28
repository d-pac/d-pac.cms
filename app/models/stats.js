'use strict';

const keystone = require('keystone');
const Types = keystone.Field.Types;


const Stat = new keystone.List("Stat", {
  track: true
});

Stat.defaultColumns = "assessment, lastRun";

//we need to do this, since keystone doesn't allow Mixed types
Stat.schema.add({stats: {byRepresentation: keystone.mongoose.Schema.Types.Mixed}});
Stat.schema.methods.reset = function () {
  this.averages.comparisonsPerAssessor = null;
  this.averages.comparisonsPerRepresentation = null;
  this.averages.durationPerAssessor = null;
  this.averages.durationPerRepresentation = null;
  this.totals.duration = null;
  this.totals.reliability = null;
  this.lastRun = null;
  return this;
};

const StatsList = require('./helpers/setupList')(Stat)
  .add({
    assessment: {
      type: Types.Relationship,
      label: "Assessment",
      ref: "Assessment",
      required: true,
      many: false,
      initial: true,
      unique: true,
      index: true,
    },
    lastRun: {
      type: Types.Datetime,
      noedit: !keystone.get('dev env'),
      label: "Last calculation ran at:",
      format: 'DD/MM/YYYY, HH:mm:ss'
    },
    isUpToDate: {
      type: Boolean,
      noedit: !keystone.get('dev env'),
      label: "Calculations up-to-date?",
      default: false
    },
    stats: {
      averages: {
        durationPerRepresentation: {
          type: Types.Number,
          noedit: true,
          label: "Average duration per representation (in seconds)"
        },
        durationPerAssessor: {
          type: Types.Number,
          noedit: true,
          label: "Average duration per assessor (in seconds)"
        },
        comparisonsPerAssessor: {
          type: Types.Number,
          noedit: true,
          label: "Average number of comparisons per assessor"
        },
        comparisonsPerRepresentation: {
          type: Types.Number,
          noedit: true,
          label: "Average number of comparisons per representation"
        },
      },
      totals: {
        duration: {
          type: Types.Number,
          noedit: true,
          label: "Total duration of all comparisons (in seconds)"
        },
        reliability: {
          type: Types.Number,
          noedit: true,
          label: "Reliability"
        },
        participatoryAssessorsNum: {
          type: Types.Number,
          default: 0,
          noedit: true,
          label: "Total number of participatory assessors"
        },
        toRankRepresentationsNum: {
          type: Types.Number,
          default: 0,
          noedit: true,
          label: "Total number of 'to rank' representations"
        },
        completedComparisonsNum: {
          type: Types.Number,
          default: 0,
          noedit: true,
          label: "Total number of completed comparisons"
        }
      }
    }
  }, "Actions", {
    actions: {
      calculate: {
        type: Types.Boolean,
        label: 'Calculate (manual stats)',
        note: 'Triggers calculation of assessment stats.',
        default: false
      }
    }
  })
  .emit('actions', 'assessment')
  .register();
