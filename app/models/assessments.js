"use strict";

const _ = require('lodash');
const keystone = require("keystone");
const Types = keystone.Field.Types;
const constants = require("./helpers/constants");
const plugins = require("../lib/pluginsScrobbler");
const fs = require('fs');
const path = require('path');

const moment = require('moment');

const Assessment = new keystone.List("Assessment", {
  track: true,
  defaultSort: "order"
});

let defaultColumns = "name, " +
  "title, " +
  "algorithm, " +
  "state, " +
  "parent";
if (keystone.get('feature enable anonymous')) {
  defaultColumns += ", enableAnonymousLogins";
}

Assessment.defaultColumns = defaultColumns;

//we need to do this, since keystone doesn't allow Mixed types
Assessment.schema.add({stats: {byRepresentation: keystone.mongoose.Schema.Types.Mixed}});
Assessment.schema.methods.reset = function () {
  this.stats.averages.comparisonsPerAssessor = null;
  this.stats.averages.comparisonsPerRepresentation = null;
  this.stats.averages.durationPerAssessor = null;
  this.stats.averages.durationPerRepresentation = null;
  this.stats.totals.duration = null;
  this.stats.totals.reliability = null;
  this.stats.lastRun = null;
  return this;
};

Assessment.schema.methods.clone = function () {
  const clone = _.omit(this.toJSON(), [
    '_id', 'feature', 'stage', 'cache', 'stats', 'parent'
  ]);
  clone.name += ' (Copy)';
  return clone;
};

const AssessmentList = require('./helpers/setupList')(Assessment)
  .add({

      name: {
        type: Types.Text,
        required: true,
        initial: true,
        label: "Administrative name",
        note: "Only used for administrative purposes, never shown in tool"
      },

      title: {
        type: Types.Text,
        required: true,
        initial: true,
        note: "The title as shown in the tool"
      },

      algorithm: {
        type: Types.Select,
        label: "Selection algorithm",
        options: plugins.list("select"),
        initial: true,
        required: true
      },
      phases: {
        type: Types.Relationship,
        label: "Workflow",
        ref: "Phase",
        required: true,
        many: true,
        initial: true
      },
      state: {
        type: Types.Select,
        options: constants.assessmentStates.list,
        default: constants.assessmentStates.ACTIVE,
        index: true
      },

    },
    'Scheduling',
    {
      feature: {
        uploads: {
          enabled: {
            type: Boolean,
            note: "When unticked assessees will NOT be able to upload files themselves",
            default: true
          },
          begin: {
            type: Types.Datetime,
            default: moment,
            dateFormat: "DD/MM/YYYY",
            timeFormat: "HH:mm",
            dependsOn: {
              "feature.uploads.enabled": true
            },
          },
          end: {
            type: Types.Datetime,
            default: null,
            dateFormat: "DD/MM/YYYY",
            timeFormat: "HH:mm",
            note: "When left blank, uploads will automatically close when comparisons begins",
            dependsOn: {
              "feature.uploads.enabled": true
            }
          }
        },
        comparisons: {
          enabled: {
            type: Boolean,
            default: true,
            note: "Cannot be unticked; always enabled",
            noedit: true
          },
          begin: {
            type: Types.Datetime,
            default: function () {
              return moment().add(1, 'd');
            },
            dateFormat: "DD/MM/YYYY",
            timeFormat: "HH:mm",
            dependsOn: {
              "feature.comparisons.enabled": true
            }
          },
          end: {
            type: Types.Datetime,
            default: null,
            dateFormat: "DD/MM/YYYY",
            timeFormat: "HH:mm",
            note: "When left blank, comparisons will automatically close when results begin",
            dependsOn: {
              "feature.comparisons.enabled": true
            }
          }
        },
        results: {
          enabled: {
            type: Boolean,
            note: "When unticked assessees and assessors will NOT be able to view the results",
            default: true
          },
          begin: {
            type: Types.Datetime,
            default: function () {
              return moment().add(2, 'd');
            },
            dateFormat: "DD/MM/YYYY",
            timeFormat: "HH:mm",
            dependsOn: {
              "feature.results.enabled": true
            }
          },
          end: {
            type: Types.Datetime,
            default: null,
            note: "When left blank, results will stay open forever",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "HH:mm",
            dependsOn: {
              "feature.results.enabled": true
            }
          }
        },
      },
    },
    "Hierarchy", {
      parent: {
        type: Types.Relationship,
        label: "After",
        ref: "Assessment",
        required: false,
        many: false,
        initial: false,
        note: `Allows you to set up a chain of assessments. <br/>
        Assessors won't be presented with this assessment until they have completed all their comparisons for the 
        selected assessment.`
      },

    },
    "Configuration",
    {
      comparisons: {
        dimension: {
          type: Types.Select,
          label: 'Define comparisons',
          options: [
            {
              label: 'per assessor',
              value: 'assessor'
            },
            {
              label: 'per representation',
              value: 'representation'
            }
          ],
          initial: true,
          required: true,
          default: "assessor"
        },
        perRepresentation: {
          type: Types.Number,
          label: "Maximum number of comparisons per representation",
          required: false,
          initial: true,
          default: 10,
          dependsOn: {
            "comparisons.dimension": 'representation'
          },
          watch: 'comparisons.dimension',
          value: function () {
            return (this.comparisons.dimension === 'assessor')
              ? 0
              : this.comparisons.perRepresentation;
          }
        },
        perAssessor: {
          type: Types.Number,
          label: "Maximum number of comparisons per assessor",
          default: 5,
          initial: true,
          dependsOn: {
            "comparisons.dimension": 'assessor'
          },
          watch: 'comparisons.dimension',
          value: function () {
            return (this.comparisons.dimension === 'representation')
              ? 0
              : this.comparisons.perAssessor;
          }
        }
      },

      assessors: {
        minimum: {
          type: Types.Number,
          label: "Minimum number of assessors needed",
          default: 4,
          initial: true,
          dependsOn: {
            "comparisons.dimension": 'assessor',
            algorithm: 'benchmarked-comparative-selection'
          }
        }
      },

      stage: {
        type: Types.Number,
        label: "Current algorithm stage",
        note: "<strong>(0-based)</strong> Multi-stage algorithms use this field for current stage storage",
        default: 0,
        noedit: true,
        dependsOn: {
          algorithm: 'benchmarked-comparative-selection'
        }
      },

      middleBoxSize: {
        type: Types.Number,
        label: "Middle box size",
        note: "expressed as a percentage [!]",
        default: 30,
        dependsOn: {
          algorithm: 'positioned-comparative-selection'
        },
      },

      minimumReliability: {
        type: Types.Number,
        label: "Required minimum reliability",
        note: "[0;1]",
        default: .7,
        dependsOn: {
          algorithm: 'positioned-comparative-selection'
        },
      },

      results: {
        assessees: {
          viewRepresentations: {
            type: Types.Boolean,
            label: "Results: allow assessees to view other representations",
            default: true
          },
          viewRanking: {
            type: Types.Boolean,
            label: "Results: allow assessees to view the ranking",
            default: true
          }
        }
      },
      enableTimeLogging: {
        type: Types.Boolean,
        label: "Enable time logging",
        note: "Will enable time logging, turn off when not necessary to reduce server strain.",
        default: false
      },

      enableNotes: {
        type: Types.Boolean,
        label: "Enable notes",
        note: "Allow assessors to take notes during a comparison",
        default: true
      },

      enableSelectionIcon: {
        type: Types.Boolean,
        label: "Enable selection icon",
        note: "Enables the ✔ sign next to the selected representation",
        default: true
      },


    });

if (keystone.get('feature enable anonymous')) {
  AssessmentList.add({
    enableAnonymousLogins: {
      type: Types.Boolean,
      label: "Enable anonymous logins",
      note: `Wil automatically register any user as a 'guest' and immediately allow him to make comparisons for this
        assessment.`,
      default: false
    },
  });
}


AssessmentList.add("Texts", {
  assignments: {
    assessor: {
      type: Types.Html,
      label: "Assessor assignment",
      wysiwyg: true,
      height: 400
    },

    assessee: {
      type: Types.Html,
      label: "Assessee assignment",
      wysiwyg: true,
      height: 400
    }
  },

  uiCopy: {
    type: Types.Code,
    lang: 'json',
    label: 'UI texts',
    note: 'Must be valid json, please check with <a href="http://jsonlint.com/">jsonlint</a>',
    default: fs.readFileSync(path.join(__dirname, 'json', 'uiTextDefaults.json'))
    // default: JSON.stringify( require( './json/uiTextDefaults.json' ), null, 2 )
  },
}, "Stats (dynamic)", {
  cache: {
    representationsNum: {
      type: Types.Number,
      default: 0,
      noedit: true,
      label: "Total number of (to rank) representations"
    },
    comparisonsNum: {
      type: Types.Number,
      default: 0,
      noedit: true,
      label: "Total number of comparisons"
    },
    assessorsNum: {
      type: Types.Number,
      default: 0,
      noedit: true,
      label: "Total number of assessors"
    }
  }

}, "Stats (manual)", {
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
    },
    lastRun: {
      type: Types.Datetime,
      noedit: !keystone.get('dev env'),
      label: "Last calculation ran at:",
      format: 'DD/MM/YYYY, HH:mm:ss'
    }
  },

}, "Actions", {
  actions: {
    calculate: {
      type: Types.Boolean,
      label: 'Calculate (manual stats)',
      note: 'Triggers calculation of assessment stats.',
      default: false
    },
    calculateMiddleBox: {
      type: Types.Boolean,
      label: '(Re-)calculate middle box',
      note: 'Triggers (re-)calculation of middle box representations',
      default: false,
      dependsOn: {
        algorithm: 'positioned-comparative-selection'
      },
    }
  }
})
  .virtualize({
    limits: {
      get: function () {
        const assessment = this.toObject();
        if (!assessment.comparisons) {
          return {};
        }
        let pA = assessment.comparisons.perAssessor || 0;
        let pR = assessment.comparisons.perRepresentation || 0;
        const rN = _.get(assessment, ['cache', 'representationsNum'], 0);
        const aN = _.get(assessment, ['cache', 'assessorsNum'], 0);
        switch (assessment.comparisons.dimension) {
          case 'representation':
            pA = (rN * pR) / (2 * aN );
            if (!_.isFinite(pA)) {
              pA = 0;
            }
            break;
          case 'assessor':
          default:
            pR = pA * 2 * aN / rN;
            if (!_.isFinite(pR)) {
              pR = 0;
            }
            break;
        }

        return {
          comparisonsNum: {
            perAssessor: Math.ceil(pA),
            perRepresentation: Math.ceil(pR)
          },
          assessorsNum: _.get(assessment, ['assessors', 'minimum'], 0),
          minimumReliability: assessment.minimumReliability || 0
        };
      },
      depends: [
        'comparisons.perAssessor', 'comparisons.perRepresentation', 'comparisons.dimension', 'cache.representationsNum',
        'cache.assessorNum', 'assessors.minimum', 'minimumReliability'
      ]
    },
  })
  .emit('actions', 'state')
  .validate({
    uiCopy: [
      function (value) {
        let isValid = true;
        try {
          JSON.parse(value);
        } catch (err) {
          isValid = false;
        }
        return isValid;
      }, '"UI texts" contains invalid JSON'
    ],
    middleBoxSize: [
      function (value) {
        return value >= 0 && value <= 100;
      }, "Middle box size must be expressed as a percentage [0;100]"
    ],
    // "feature.uploads.begin": [
    //   function (value) {
    //     return false;
    //   }, "Uploads begin!"
    // ]
  })
  .retain("track")
  .relate({
    path: "representations",
    ref: "Representation",
    refPath: "assessment",
    label: "Representations"
  }, {
    path: "comparisons",
    ref: "Comparison",
    refPath: "assessment",
    label: "Comparisons"
  }, {
    path: "assessors",
    ref: "User",
    refPath: "assessments.assessor",
    label: "Assessors"
  }, {
    path: "assessees",
    ref: "User",
    refPath: "assessments.assessee",
    label: "Assessees"
  }, {
    path: "pams",
    ref: "User",
    refPath: "assessments.pam",
    label: "PAMs"
  }, {
    path: "next",
    ref: "Assessment",
    refPath: "parent",
    label: "Next"
  })
  .register();

