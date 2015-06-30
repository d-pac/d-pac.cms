"use strict";

var keystone = require( "keystone" );
var Types = keystone.Field.Types;

var constants = module.exports = {
  ASSESSOR: "Assessor",
  ASSESSEE: "Assessee",
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  BENCHMARK: "benchmark",
  TO_RANK: "to rank",
  RANKED: "ranked"
};

module.exports.roles = {
  list: [ constants.ASSESSOR, constants.ASSESSEE ],
  assessor: constants.ASSESSOR,
  assessee: constants.ASSESSEE
};

module.exports.publicationStates = {
  list: [ constants.DRAFT, constants.PUBLISHED, constants.ARCHIVED ],
  draft: constants.DRAFT,
  published: constants.PUBLISHED,
  archived: constants.ARCHIVED
};

module.exports.representationTypes = {
  list: [ constants.TO_RANK, constants.RANKED, constants.BENCHMARK ]
};

module.exports.phases = [
  {
    slug: "selection",
    label: "Select best",
    field: {
      label: "Selected Representation",
      type: Types.Relationship,
      ref: "Representation",
      index: true,
      initial: false,
      required: false,
      many: false,
      default: null
    }
  },
  {
    slug: "comparative",
    label: "Provide comparative Feedback",
    field: {
      label: "Comparative feedback",
      type: Types.Textarea,
      default: ""
    }
  },
  {
    slug: "passfail",
    label: "Indicate Pass/Fail",
    field: {
      a: {
        label: "Representation A Passed?",
        type: Types.Boolean
      },
      b: {
        label: "Representation B Passed?",
        type: Types.Boolean
      }
    }
  },
  {
    slug: "seq-selection",
    label: "Select best SEQ",
    field: {
      type: Types.Number,
      label: "SEQ select best"
    }
  },
  {
    slug: "seq-comparative",
    label: "Comparative feedback SEQ",
    field: {
      type: Types.Number,
      label: "SEQ comparative feedback"
    }
  },
  {
    slug: "seq-passfail",
    label: "Pass/fail SEQ",
    field: {
      type: Types.Number,
      label: "SEQ pass fail"
    }
  }
];
