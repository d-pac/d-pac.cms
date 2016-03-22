"use strict";
var _ = require( 'lodash' );
var keystone = require( "keystone" );
var Types = keystone.Field.Types;

function formatBody( body ){
  return body.replace( /(?:\r\n|\r|\n)/g, "\u21A9" ).replace( /"/g, "'" );
}

var constants = module.exports = {
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
  SEQ_PASSFAIL: "seq-passfail",
  SELECT_OTHER: "select-other"
};

module.exports.directories = {
  bulk: 'app/uploads/bulk',
  reports: 'app/reports',
  documents: 'app/uploads/media',
  archive: 'app/archive'
};

module.exports.roles = {
  ASSESSOR: {
    label: "Assessor",
    value: 'assessor'
  },
  ASSESSEE: {
    label: "Assessee",
    value: 'assessee'
  },
  PAM: {
    label: 'PAM',
    value: 'pam'
  },
};
module.exports.roles.list = [ module.exports.roles.ASSESSOR, module.exports.roles.ASSESSEE, module.exports.roles.PAM ];

module.exports.assessmentStates = {
  DRAFT: "draft",
  PUBLISHED: "published",
  COMPLETED: "completed",
  ARCHIVED: "archived",
};
module.exports.assessmentStates.list = _.values( module.exports.assessmentStates );

module.exports.representationTypes = {
  list: [ constants.TO_RANK, constants.RANKED, constants.BENCHMARK ]
};

module.exports.conflicts = {
  list: [ constants.OVERWRITE, constants.REUSE, constants.RENAME ]
};

module.exports.recipientTypes = {
  ASSESSORS: {
    label: 'Assessors',
    value: 'assessors'
  },
  ASSESSEES: {
    label: 'Assessees',
    value: 'assessees'
  },
  ASSESSMENT: {
    label: 'Both (assessors & assessees)',
    value: 'assessment'
  },
  PAM: {
    label: 'PAM',
    value: 'pam'
  },
  ADMIN: {
    label: 'Administrator',
    value: 'admin'
  },
  ANY: {
    label: 'Select manually',
    value: 'manual'
  }
};
module.exports.recipientTypes.list = [
  module.exports.recipientTypes.ASSESSORS,
  module.exports.recipientTypes.ASSESSEES,
  module.exports.recipientTypes.ASSESSMENT,
  module.exports.recipientTypes.PAM,
  module.exports.recipientTypes.ADMIN,
  module.exports.recipientTypes.ANY
];

module.exports.phases = [
  {
    slug: constants.SELECTION,
    label: "Select best",
    field: {
      label: "Selected representation",
      type: Types.Relationship,
      ref: "Representation",
      index: true,
      initial: false,
      required: false,
      many: false,
      default: null
    },
    format: {
      reports: function( comparison ){
        return {
          "Selected representation": _.get( comparison, [
            'data', constants.SELECTION, 'document', 'name'
          ], "" )
        };
      }
    }
  },
  {
    slug: constants.SELECT_OTHER,
    label: "Select best (other criterion)",
    field: {
      label: "Selected representation (other criterion)",
      type: Types.Relationship,
      ref: "Representation",
      initial: false,
      required: false,
      many: false,
      default: null
    },
    format: {
      reports: function( comparison ){
        return {
          "Selected representation (other)": _.get( comparison, [
            'data', constants.SELECT_OTHER, 'document', 'name'
          ], "" )
        };
      }
    }
  },
  {
    slug: constants.COMPARATIVE,
    label: "Provide comparative Feedback",
    field: {
      label: "Comparative feedback",
      type: Types.Textarea
    },
    format: {
      reports: function( comparison ){
        return {
          "Comparative feedback": formatBody( _.get( comparison, [
            'data', constants.COMPARATIVE
          ], '' ) )
        };
      }
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
    },
    format: {
      reports: function( comparison ){
        return {
          "A+": formatBody( _.get( comparison, [ 'data', constants.PROSCONS, 'aPositive' ], '' ) ),
          "A-": formatBody( _.get( comparison, [ 'data', constants.PROSCONS, 'aNegative' ], '' ) ),
          "B+": formatBody( _.get( comparison, [ 'data', constants.PROSCONS, 'bPositive' ], '' ) ),
          "B-": formatBody( _.get( comparison, [ 'data', constants.PROSCONS, 'bNegative' ], '' ) ),
        };
      }
    }
  },
  {
    slug: constants.PASSFAIL,
    label: "Indicate Pass/Fail",
    field: {
      a: {
        label: "Representation A Passed?",
        type: String
      },
      b: {
        label: "Representation B Passed?",
        type: String
      }
    },
    format: {
      reports: function( comparison ){
        return {
          "A passed": _.get( comparison, [ 'data', constants.PASSFAIL, 'a' ], "N/A" ),
          "B passed": _.get( comparison, [ 'data', constants.PASSFAIL, 'b' ], "N/A" ),
        };
      }
    }
  },
  {
    slug: constants.SEQ_SELECTION,
    label: "Select best SEQ",
    field: {
      type: Types.Number,
      label: "SEQ select best"
    },
    format: {
      reports: function( comparison ){
        return {
          "Select best SEQ": _.get( comparison, [ 'data', constants.SEQ_SELECTION ], -1 )
        }
      }
    }
  },
  {
    slug: constants.SEQ_COMPARATIVE,
    label: "Comparative feedback SEQ",
    field: {
      type: Types.Number,
      label: "SEQ comparative feedback"
    },
    format: {
      reports: function( comparison ){
        return {
          "Comparative feedback SEQ": _.get( comparison, [ 'data', constants.SEQ_COMPARATIVE ], -1 )
        }
      }
    }
  },
  {
    slug: constants.SEQ_PASSFAIL,
    label: "Pass/fail SEQ",
    field: {
      type: Types.Number,
      label: "SEQ pass fail"
    },
    format: {
      reports: function( comparison ){
        return {
          "Pass/fail SEQ": _.get( comparison, [ 'data', constants.SEQ_PASSFAIL ], -1 )
        }
      }
    }
  }
];

