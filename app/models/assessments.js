"use strict";

var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var constants = require( "./helpers/constants" );
var plugins = require( "../lib/pluginsScrobbler" );

var Assessment = new keystone.List( "Assessment", {
  track: true,
  defaultSort: "order"
} );

Assessment.defaultColumns = "name, title, algorithm, stage, state, parent";

//we need to do this, since keystone doesn't allow Mixed types
Assessment.schema.add( { stats: keystone.mongoose.Schema.Types.Mixed } );

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
      comparisonsNum: {
        perRepresentation: {
          type: Types.Number,
          label: "Maximum number of comparisons per representation",
          required: false,
          initial: true,
          default: 10,
          dependsOn: {
            algorithm: 'benchmarked-comparative-selection'
          }
        },
        perAssessor: {
          type: Types.NumberArray,
          label: "Maxmimum number of comparisons per assessor",
          default: [ 5 ],
          initial: true,
          note: 'per stage if applicable'
        }
      },

      stage: {
        type: Types.Number,
        label: "Algorithm stage",
        note: "<strong>(0-based)</strong> Multi-stage algorithms use this field for current stage storage",
        default: 0
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
        default: "{\r\n    \"phase_selection\": {\r\n        \"title\": \"Beoordeel\",\r\n        \"description\": \"Geef aan welke tekst beter geschreven is in functie van  de competentie 'argumentatief schrijven'\",\r\n        \"a_button\": {\r\n            \"label\" : \"Tekst A is beter\",\r\n            \"tooltip\": \"Klik om aan te duiden dat tekst A beter is dan B.\"\r\n        },\r\n        \"b_button\": {\r\n            \"label\": \"Tekst B is beter\",\r\n            \"tooltip\": \"Klik om aan te duiden dat tekst B beter is dan A.\"\r\n        }\r\n    },\r\n    \"phase_comparative\": {\r\n        \"title\": \"Vergelijk\",\r\n        \"description\": \"Licht kort je keuze toe\"\r\n    },\r\n    \"phase_pros-cons\": {\r\n        \"title\": \"Vergelijk\",\r\n        \"description\": \"Beschrijf hier wat je positief en negatief vond aan de teksten:\",\r\n        \"a_title\": \"Tekst A\",\r\n        \"b_title\": \"Tekst B\",\r\n        \"positive\": \"Positief\",\r\n        \"negative\": \"Negatief\"\r\n    },\r\n    \"phase_passfail\":{\r\n        \"title\":\"Geslaagd of niet?\",\r\n        \"description\" : \"Duid aan of deze teksten volgens jou geslaagd zijn voor de opdracht.\",\r\n        \"options\": {\r\n          \"passed\" : {\r\n              \"label\" : \"Geslaagd\",\r\n              \"icon\" : \"ok\"\r\n          },\r\n          \"failed\" : { \r\n              \"label\":\"Niet geslaagd\", \r\n              \"icon\":\"remove\"\r\n          },\r\n          \"undecided\" : { \r\n              \"label\" : \"Weet het niet\", \r\n              \"icon\": \"question-sign\"\r\n          }\r\n        }\r\n    },\r\n    \"phase_seq-selection\": {\r\n\t    \"title\": \"Hoe moeilijk vond je het om de keuze te maken?\"\r\n\t},\r\n  \t\"phase_seq-comparative\": {\r\n    \t\"title\": \"Hoe moeilijk vond je het om je keuze te beargumenteren?\"\r\n\t},\r\n    \"phase_seq-passfail\": {\r\n    \t\"title\": \"Hoe moeilijk vond je het om geslaagd/niet geslaagd te kiezen?\"\r\n\t},\r\n    \"representation_viewer\": {\r\n        \"pdf\":{\r\n            \"tooltip\": \"Gebruik de knoppen rechts bovenaan om de paper fullscreen te bekijken of te downloaden.\"\r\n        },\r\n        \"image\": {\r\n            \"tooltip\": \"Klik om deze tekst te selecteren\"\r\n        }\r\n    },\r\n    \"notes\" : {\r\n        \"label\" : \"Notities\",\r\n        \"tooltip\" : \"Noteer hier je opmerkingen bij deze tekst.\"\r\n    }\r\n}\r\n"
      },
    }, "Actions", {
      actions: {
        calculate: {
          type: Types.Boolean,
          label: 'Calculate',
          note: 'Triggers calculation of assessment stats.',
          default: false
        }
      }
    } )
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

