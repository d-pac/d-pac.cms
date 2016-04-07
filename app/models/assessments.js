"use strict";

const _ = require( 'lodash' );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var constants = require( "./helpers/constants" );
var plugins = require( "../lib/pluginsScrobbler" );

var Assessment = new keystone.List( "Assessment", {
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
          required: true
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
        default: "{\r\n    \"phase_selection\": {\r\n        \"title\": \"Beoordeel\",\r\n        \"description\": \"Geef aan welke tekst beter geschreven is in functie van  de competentie 'argumentatief schrijven'\",\r\n        \"a_button\": {\r\n            \"label\" : \"Tekst A is beter\",\r\n            \"tooltip\": \"Klik om aan te duiden dat tekst A beter is dan B.\"\r\n        },\r\n        \"b_button\": {\r\n            \"label\": \"Tekst B is beter\",\r\n            \"tooltip\": \"Klik om aan te duiden dat tekst B beter is dan A.\"\r\n        }\r\n    },\r\n    \"phase_select-other\": {\r\n      \"title\": \"Beoordeel\",\r\n      \"description\": \"Welke tekst voelt intuitief beter aan?\",\r\n      \"a_button\": {\r\n        \"label\": \"Tekst A is beter\",\r\n        \"tooltip\": \"Klik om aan te duiden dat tekst A beter is dan B.\"\r\n      },\r\n      \"b_button\": {\r\n        \"label\": \"Tekst B is beter\",\r\n        \"tooltip\": \"Klik om aan te duiden dat tekst B beter is dan A.\"\r\n      },\r\n      \"sending\": \"Even geduld...\"\r\n  \t},\r\n    \"phase_comparative\": {\r\n        \"title\": \"Vergelijk\",\r\n        \"description\": \"Licht kort je keuze toe\"\r\n    },\r\n    \"phase_pros-cons\": {\r\n        \"title\": \"Vergelijk\",\r\n        \"description\": \"Beschrijf hier wat je positief en negatief vond aan de teksten:\",\r\n        \"a_title\": \"Tekst A\",\r\n        \"b_title\": \"Tekst B\",\r\n        \"positive\": \"Positief\",\r\n        \"negative\": \"Negatief\"\r\n    },\r\n    \"phase_passfail\":{\r\n        \"title\":\"Hor ot not?\",\r\n        \"description\" : \"Duid aan of deze goed genoeg zijn.\",\r\n        \"options\": {\r\n          \"passed\" : {\r\n              \"label\" : \"Goed\",\r\n              \"icon\" : \"ok\"\r\n          },\r\n          \"failed\" : { \r\n              \"label\":\"Niet goed\", \r\n              \"icon\":\"remove\"\r\n          }\r\n        }\r\n    },\r\n    \"phase_seq-selection\": {\r\n\t    \"title\": \"Hoe moeilijk vond je het om de keuze te maken?\"\r\n\t},\r\n  \t\"phase_seq-comparative\": {\r\n    \t\"title\": \"Hoe moeilijk vond je het om je keuze te beargumenteren?\"\r\n\t},\r\n    \"phase_seq-passfail\": {\r\n    \t\"title\": \"Hoe moeilijk vond je het om geslaagd/niet geslaagd te kiezen?\"\r\n\t},\r\n    \"representation_viewer\": {\r\n        \"pdf\":{\r\n            \"tooltip\": \"Gebruik de knoppen rechts bovenaan om de paper fullscreen te bekijken of te downloaden.\"\r\n        },\r\n        \"image\": {\r\n            \"tooltip\": \"Klik om deze tekst te selecteren\"\r\n        }\r\n    },\r\n    \"notes\" : {\r\n        \"label\" : \"Notities\",\r\n        \"tooltip\" : \"Noteer hier je opmerkingen bij deze tekst.\"\r\n    },\r\n    \"uploads\":{\r\n        \"description\": \"Laad hier je bestand op\"\r\n    }\r\n}\r\n",
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
          assessorsNum: _.get( assessment, [ 'assessors', 'minimum' ], 0 )
        }
      },
      depends: [
        'comparisons.perAssessor', 'comparisons.perRepresentation', 'comparisons.dimension', 'cache.representationsNum',
        'cache.assessorNum', 'assessors.minimum'
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
    ]
  } )
  .retain( "track", "assessors", "comparisons" )
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

