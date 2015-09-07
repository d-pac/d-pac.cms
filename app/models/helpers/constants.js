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
  RANKED: "ranked",
  OVERWRITE: 'overwrite',
  REUSE: 'reuse',
  RENAME: 'rename',
  SELECTION: 'selection',
  COMPARATIVE: "comparative",
  PROSCONS: "pros-cons",
  PASSFAIL: "passfail",
  SEQ_SELECTION: "seq-selection",
  SEQ_COMPARATIVE: "seq-comparative",
  SEQ_PASSFAIL: "seq-passfail"
};

module.exports.directories = {
  bulk: 'app/uploads/bulk',
  reports: 'app/reports',
  documents: 'app/uploads/media'
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

module.exports.conflicts = {
  list: [ constants.OVERWRITE, constants.REUSE, constants.RENAME]
};

module.exports.phases = [
  {
    slug: constants.SELECTION,
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
    slug: constants.COMPARATIVE,
    label: "Provide comparative Feedback",
    field: {
      label: "Comparative feedback",
      type: Types.Textarea,
      default: ""
    }
  },
  {
    slug: constants.PROSCONS,
    label: "Pros & cons",
    field: {
      aPositive: {
        label: "Positive in representation A",
        type: Types.Text
      },
      aNegative: {
        label: "Negative in representation A",
        type: Types.Text
      },
      bPositive: {
        label: "Positive in representation B",
        type: Types.Text
      },
      bNegative: {
        label: "Negative in representation B",
        type: Types.Text
      }
    }
  },
  {
    slug: constants.PASSFAIL,
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
    slug: constants.SEQ_SELECTION,
    label: "Select best SEQ",
    field: {
      type: Types.Number,
      label: "SEQ select best"
    }
  },
  {
    slug: constants.SEQ_COMPARATIVE,
    label: "Comparative feedback SEQ",
    field: {
      type: Types.Number,
      label: "SEQ comparative feedback"
    }
  },
  {
    slug: constants.SEQ_PASSFAIL,
    label: "Pass/fail SEQ",
    field: {
      type: Types.Number,
      label: "SEQ pass fail"
    }
  }
];

