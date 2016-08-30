"use strict";

const _ = require( 'lodash' );
const keystone = require( "keystone" );
const Types = keystone.Field.Types;
const constants = require( "./helpers/constants" );
const plugins = require( "../lib/pluginsScrobbler" );
const fs = require( 'fs' );
const path = require( 'path' );

const Assessment = new keystone.List( "Assessment", {
  track: true,
  defaultSort: "order"
} );

Assessment.defaultColumns = "name, " +
  "title, " +
  "algorithm, " +
  "state, " +
  "parent";

//we need to do this, since keystone doesn't allow Mixed types
Assessment.schema.add( { stats: { byRepresentation: keystone.mongoose.Schema.Types.Mixed } } );
Assessment.schema.methods.reset = function(){
  this.stats.averages.comparisonsPerAssessor = null;
  this.stats.averages.comparisonsPerRepresentation = null;
  this.stats.averages.durationPerAssessor = null;
  this.stats.averages.durationPerRepresentation = null;
  this.stats.totals.duration = null;
  this.stats.totals.reliability = null;
  this.stats.lastRun = null;
  return this;
};

// Assessment.schema.virtual( 'limits' ).get(  );

require( './helpers/setupList' )( Assessment )
  .add( {

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
        options: plugins.list( "select" ),
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

    },
    'Publication',
    {
      state: {
        type: Types.Select,
        options: constants.assessmentStates.list,
        default: constants.assessmentStates.DRAFT,
        index: true
      },

      schedule: {
        active: {
          type: Boolean,
          default: false,
          label: "Activate schedule"
        },
        begin: {
          type: Types.Date,
          label: "Begin date",
          note: "Automatically sets assessment to 'published' on this date (at 0:01)." +
          "<br/>Leave blank to disable automatic publication.",
          required: false,
          dependsOn: {
            "schedule.active": true
          }
        },
        end: {
          type: Types.Date,
          label: "End date",
          note: "Automatically sets assessment to 'archived' on this date (at 0:01 the next day)." +
          "<br/>Leave blank to disable automatic archiving.",
          required: false,
          dependsOn: {
            "schedule.active": true
          }
        }
      },

      parent: {
        type: Types.Relationship,
        label: "After",
        ref: "Assessment",
        required: false,
        many: false,
        initial: false,
        note: "Allows you to set up a chain of assessments. " +
        "(Assessors won't be presented with this assessment until the referenced assessment is finished)."
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
          value: function(){
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
          value: function(){
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
        dependsOn:{
          algorithm: 'positioned-comparative-selection'
        },
      },

      minimumReliability:{
        type: Types.Number,
        label: "Required minimum reliability",
        note: "[0;1]",
        default: .7,
        dependsOn:{
          algorithm: 'positioned-comparative-selection'
        },
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

      results: {
        enable: {
          type: Types.Boolean,
          label: "Results: enable viewing",
          note: "Results will only be viewable when available <strong>and</strong> this is checked.",
          default: true
        },
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
      }

    }, "Texts", {
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
        default: fs.readFileSync( path.join( __dirname, 'json', 'uiTextDefaults.json' ) )
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
          noedit: true,
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
        }
      }
    } )
  .virtualize( {
    limits: {
      get: function(){
        const assessment = this.toObject();
        if( !assessment.comparisons ){
          return {};
        }
        let pA = assessment.comparisons.perAssessor || 0;
        let pR = assessment.comparisons.perRepresentation || 0;
        const rN = _.get( assessment, [ 'cache', 'representationsNum' ], 0 );
        const aN = _.get( assessment, [ 'cache', 'assessorsNum' ], 0 );
        switch( assessment.comparisons.dimension ){
          case 'representation':
            pA = (rN * pR) / (2 * aN );
            if( !_.isFinite( pA ) ){
              pA = 0;
            }
            break;
          case 'assessor':
          default:
            pR = pA * 2 * aN / rN;
            if( !_.isFinite( pR ) ){
              pR = 0;
            }
            break;
        }

        return {
          comparisonsNum: {
            perAssessor: pA,
            perRepresentation: pR
          },
          assessorsNum: _.get( assessment, [ 'assessors', 'minimum' ], 0 ),
          minimumReliability: assessment.minimumReliability || 0
        };
      },
      depends: [
        'comparisons.perAssessor', 'comparisons.perRepresentation', 'comparisons.dimension', 'cache.representationsNum',
        'cache.assessorNum', 'assessors.minimum', 'minimumReliability'
      ]
    }
  } )
  .emit( 'actions' )
  .validate( {
    uiCopy: [
      function( value ){
        var isValid = true;
        try{
          JSON.parse( value );
        } catch( err ) {
          isValid = false;
        }
        return isValid;
      }, '"UI texts" contains invalid JSON'
    ],
    middleBoxSize: [
      function(value){
        return value >= 0 && value <= 100;
      }, "Middle box size must be expressed as a percentage [0;100]"
    ]
  } )
  .retain( "track" )
  .relate( {
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
  } )
  .register();

