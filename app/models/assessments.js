"use strict";

var _ = require( "underscore" );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;
var constants = require( "./helpers/constants" );
var plugins = require( "keystone-dpac-plugins" );

var Assessment = new keystone.List( "Assessment", {
  map         : {
    name : "title"
  },
  track       : true,
  defaultSort : "order"
} );

var config = {

  title : {
    type     : Types.Text,
    required : true,
    initial  : true
  },

  algorithm : {
    type     : Types.Select,
    label    : "Selection algorithm",
    options  : plugins.list( "select" ),
    initial  : true,
    required : true
  },

  assignments : {
    assessor : {
      type    : Types.Html,
      label   : "Assessor assignment",
      wysiwyg : true,
      height  : 400
    },

    assessee : {
      type    : Types.Html,
      label   : "Assessee assignment",
      wysiwyg : true,
      height  : 400
    }
  },

  phases : {
    type     : Types.Relationship,
    label    : "Workflow",
    ref      : "Phase",
    required : true,
    many     : true,
    initial  : true
  },

  comparisonsNum : {
    type     : Types.Number,
    label    : "Number of comparisons",
    required : true,
    initial  : true,
    default  : 20
  },

  state : {
    type    : Types.Select,
    options : constants.publicationStates.list.toString(),
    default : constants.publicationStates.draft,
    index   : true
  },

  order : {
    type    : Types.Number,
    label   : "Sort order",
    note    : "Used to determine the order in which assessments need to be handled by the assessor (numeric sort)",
    default : 0
  },

  stage : {
    type    : Types.Number,
    label   : "Algorithm stage",
    note    : "Multi-stage algorithms use this field for current stage storage",
    default : 0
  },

  enableTimeLogging : {
    type    : Types.Boolean,
    label   : "Enable time logging",
    note    : "Will enable time logging, turn off when not necessary to reduce server strain.",
    default : true
  },

  uiCopy : {
    type    : Types.Code,
    lang    : 'json',
    label   : 'UI texts',
    note    : 'Must be valid json, please check with <a href="http://jsonlint.com/">jsonlint</a>',
    default : "{\r\n    \"title\": \"Assessments\",\r\n    \"description\": \"\",\r\n    \"selection\": {\r\n        \"plain\" : {\r\n            \"title\": \"Assessments\",\r\n            \"list\" : {\r\n                \"description\": \"Kies een assessment.\"\r\n            },\r\n            \"empty\": {\r\n                \"description\": \"U hebt geen actieve assessments.\"\r\n            }\r\n        },\r\n        \"thanks\": {\r\n            \"title\": \"Bedankt om alle taken te hebben uitgevoerd in deze assessment !\",\r\n            \"list\": {\r\n                \"description\": \"Ga door met een ander assessment.\"\r\n            },\r\n            \"empty\": {\r\n                \"description\": \"U hebt al uw assessments uitgevoerd.\"\r\n            }\r\n        }\r\n    },\r\n    \"comparisons\": {\r\n        \"title\": \"Beoordeling\",\r\n        \"description\": \"\",\r\n        \"progressbar\": {\r\n            \"tooltip\": \"Toont je informatie over je vooruitgang.\",\r\n            \"label\": \"Je hebt <strong>__completed__</strong> van <strong>__count__</strong> vergelijking in deze assessment uitgevoerd.\",\r\n            \"label_plural\" : \"Je hebt <strong>__completed__</strong> van <strong>__count__</strong> vergelijkingen in deze assessment uitgevoerd.\"\r\n        },\r\n        \"judgement\": {\r\n            \"title\": \"Beoordeel\",\r\n            \"description\": \"Geef aan welke schilderij beter is.\",\r\n            \"leftButton\": {\r\n                \"label\": \"Linker schilderij is beter\",\r\n                \"tooltip\": \"Klik om aan te duiden dat de linkse schilderij beter is dan de rechtse.\"\r\n            },\r\n            \"rightButton\": {\r\n                \"label\": \"Rechter schilderij is beter\",\r\n                \"tooltip\": \"Klik om aan te duiden dat de rechtse schilderij beter is dan de linkse\"\r\n            }\r\n        },\r\n        \"seq\":{\r\n            \"legend\" : {\r\n                \"easy\" : {\r\n                    \"label\": \"Heel gemakkelijk\"\r\n                },\r\n                \"hard\" : {\r\n                    \"label\": \"Heel moeilijk\"\r\n                }\r\n            },\r\n            \"submitButton\": {\r\n                \"label\" : \"Opslaan\"\r\n            },\r\n            \"default\": {\r\n                \"description\" : \"Hoe moeilijk vond je de vorige opdracht?\"\r\n            },\r\n            \"select-best-seq\" : {\r\n                \"description\" : \"Hoe moeilijk vond je het om de keuze te maken?\"\r\n            },\r\n            \"comparative-feedback-seq\": {\r\n                \"description\" : \"Hoe moeilijk vond je het om je keuze te beargumenteren?\"\r\n            },\r\n            \"passfail-seq\" : {\r\n                \"description\" : \"Hoe moeilijk vond je het om geslaagd/niet geslaagd te kiezen?\"\r\n            }\r\n        },\r\n        \"compare\":{\r\n            \"title\": \"Vergelijk\",\r\n            \"description\": \"Beschrijf hier waarom je het ene schilderij beter vond dan de andere\",\r\n            \"submitButton\": {\r\n                \"label\" : \"Opslaan\"\r\n            }\r\n        },\r\n        \"passfail\":{\r\n            \"title\":\"Geslaagd of niet?\",\r\n            \"description\" : \"Duid aan of deze schilderijen volgens jou geslaagd zijn voor de opdracht.\",\r\n            \"submitButton\": {\r\n                \"label\": \"Opslaan\"\r\n            },\r\n            \"options\": {\r\n                \"passed\" : {\r\n                    \"label\" : \"Geslaagd\",\r\n                    \"icon\" : \"ok\"\r\n                },\r\n                \"failed\" : { \"label\":\"Niet geslaagd\", \"icon\":\"remove\"},\r\n                \"undecided\" : { \"label\" : \"Weet het niet\", \"icon\": \"question-sign\"}\r\n            }\r\n        },\r\n        \"representations\": {\r\n            \"tooltip\": \"\"\r\n        },\r\n        \"notes\" : {\r\n            \"label\" : \"Notities\",\r\n            \"tooltip\" : \"Noteer hier je opmerkingen bij dit schilderij.\"\r\n        },\r\n        \"completed\": {\r\n            \"label\" : \"Uw beoordeling wordt bewaard. Even geduld.\"\r\n        }\r\n    },\r\n    \"workflow\": {\r\n        \"empty\": {\r\n            \"description\": \"Deze assessment is verkeerd geconfigureerd.\"\r\n        }\r\n    }\r\n}\r\n"
  }

};
Assessment.defaultColumns = "title, createdBy, state, order";

require( './helpers/setupList' )( Assessment )
  .add( config )
  .relate( {
    path    : "representations",
    ref     : "Representation",
    refPath : "assessment",
    label   : "Representations"
  }, {
    path    : "comparisons",
    ref     : "Comparison",
    refPath : "assessment",
    label   : "Comparisons"
  }, {
    path    : "assessors",
    ref     : "User",
    refPath : "assessments",
    label   : "Assessors"
  } )
  .register();

