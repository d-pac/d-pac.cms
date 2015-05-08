"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var constants = require( "./helpers/constants" );
var plugins = require( "keystone-dpac-plugins" );

var Assessment = new keystone.List( "Assessment", {
  map: {
    name: "title"
  },
  track: true,
  defaultSort: "order",
  toJSON: {
    transformations: {
      uiCopy: function( val ){
        return JSON.parse( val );
      }
    }
  }
} );

var config = {

  title: {
    type: Types.Text,
    required: true,
    initial: true
  },

  algorithm: {
    type: Types.Select,
    label: "Selection algorithm",
    options: plugins.list( "select" ),
    initial: true,
    required: true
  },

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

  phases: {
    type: Types.Relationship,
    label: "Workflow",
    ref: "Phase",
    required: true,
    many: true,
    initial: true
  },

  comparisonsNum: {
    total: {
      type: Types.Number,
      label: "Number of comparisons wanted in total.",
      required: true,
      initial: true,
      default: 20
    },
    stage: {
      type: Types.NumberArray,
      label: "Number of comparisons wanted per stage.",
      default: [ 5 ]
    }
  },

  state: {
    type: Types.Select,
    options: constants.publicationStates.list.toString(),
    default: constants.publicationStates.draft,
    index: true
  },

  parent: {
    type: Types.Relationship,
    label: "After",
    ref: "Assessment",
    required: false,
    many: false,
    initial: false,
    note: "Allows you to set up a chain of assessments. (Assessors won't be presented with this assessment until the referenced assessment is finished)."
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
    default: true
  },

  uiCopy: {
    type: Types.Code,
    lang: 'json',
    label: 'UI texts',
    note: 'Must be valid json, please check with <a href="http://jsonlint.com/">jsonlint</a>',
    default: "{\r\n    \"common\": {\r\n        \"title\": \"Assessments\",\r\n        \"completed\":  \"Uw beoordeling wordt bewaard. Even geduld.\",\r\n        \"save_button\": {\r\n            \"label\": \"Opslaan\"\r\n        },\r\n        \"continue_button\": {\r\n            \"label\": \"Opslaan en verdergaan\"\r\n        },\r\n        \"stop_button\": {\r\n            \"label\": \"Opslaan en stoppen\"\r\n        },\r\n        \"pause_button\": {\r\n            \"label\": \"Pauzeren\"\r\n        }\r\n    },\r\n    \"assessment_selection\": {\r\n        \"title\": \"Assessments\",\r\n        \"description\": \"Kies een assessment.\",\r\n        \"empty\": \"U hebt geen actieve assessments.\",\r\n        \"thanks\": \"Bedankt om alle taken te hebben uitgevoerd in deze assessment !\",\r\n        \"completed\": \"U hebt al uw assessments uitgevoerd.\",\r\n        \"continue_button\": {\r\n            \"label\": \"Ga door met een ander assessment.\"\r\n        }\r\n    },\r\n    \"assessment_progressbar\": {\r\n        \"tooltip\": \"Toont je informatie over je vooruitgang.\",\r\n        \"label\": \"Je hebt <strong>__completed__</strong> van <strong>__count__</strong> vergelijkingen in deze assessment uitgevoerd.\",\r\n        \"label_plural\" : \"Je hebt <strong>__completed__</strong> van <strong>__count__</strong> vergelijkingen in deze assessment uitgevoerd.\"\r\n    },\r\n    \"phase_selection\": {\r\n        \"title\": \"Beoordeel\",\r\n        \"description\": \"Geef aan welke tekst beter geschreven is in functie van  de competentie 'argumentatief schrijven'\",\r\n        \"a_button\": {\r\n            \"label\" : \"Tekst A is beter\",\r\n            \"tooltip\": \"Klik om aan te duiden dat tekst A beter is dan B.\"\r\n        },\r\n        \"b_button\": {\r\n            \"label\": \"Tekst B is beter\",\r\n            \"tooltip\": \"Klik om aan te duiden dat tekst B beter is dan A.\"\r\n        }\r\n    },\r\n    \"phase_comparative\": {\r\n        \"title\": \"Vergelijk\",\r\n        \"description\": \"Beschrijf hier waarom je de ene tekst beter vond dan de andere\"\r\n    },\r\n    \"phase_passfail\":{\r\n        \"title\":\"Geslaagd of niet?\",\r\n        \"description\" : \"Duid aan of deze teksten volgens jou geslaagd zijn voor de opdracht.\",\r\n        \"passed\" : {\r\n            \"label\" : \"Geslaagd\",\r\n            \"icon\" : \"ok\"\r\n        },\r\n        \"failed\" : { \r\n            \"label\":\"Niet geslaagd\", \r\n            \"icon\":\"remove\"\r\n        },\r\n        \"undecided\" : { \r\n            \"label\" : \"Weet het niet\", \r\n            \"icon\": \"question-sign\"\r\n        }\r\n    },\r\n    \"representation_viewer\": {\r\n        \"pdf\":{\r\n            \"tooltip\": \"Gebruik de knoppen rechts bovenaan om de paper fullscreen te bekijken of te downloaden.\"\r\n        },\r\n        \"image\": {\r\n            \"tooltip\": \"Klik om deze tekst te selecteren\"\r\n        }\r\n    },\r\n    \"notes\" : {\r\n        \"label\" : \"Notities\",\r\n        \"tooltip\" : \"Noteer hier je opmerkingen bij deze tekst.\"\r\n    },\r\n    \"workflow\": {\r\n        \"empty\": {\r\n            \"description\": \"Deze assessment is verkeerd geconfigureerd.\"\r\n        }\r\n    }\r\n}\r\n"
  }

};
Assessment.defaultColumns = "title, createdBy, state, parent";

require( './helpers/setupList' )( Assessment )
  .add( config )
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
    refPath: "assessments",
    label: "Assessors"
  }, {
    path: "next",
    ref: "Assessment",
    refPath: "parent",
    label: "Next"
  } )
  .register();

