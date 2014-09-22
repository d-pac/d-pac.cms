'use strict';

var _ = require( 'underscore' );

var constants = module.exports = {
  JUDGEMENT       : 'judgement',
  JUDGEMENT_SEQ   : 'judgementSEQ',
  COMPARATIVE     : 'comparative',
  COMPARATIVE_SEQ : 'comparative_SEQ',
  PASS_FAIL       : 'passfail',
  PASS_FAIL_SEQ   : 'passfailSEQ',
  INDIVIDUAL      : 'individual',
  INDIVIDUAL_SEQ  : 'individualSEQ',
  ASSESSOR        : 'Assessor',
  ASSESSEE        : 'Assessee',
  DRAFT           : 'draft',
  PUBLISHED       : 'published',
  ARCHIVED        : 'archived'
};

module.exports.comparisonSteps = [
  { value : constants.JUDGEMENT, label : "Judgement" },
  { value : constants.JUDGEMENT_SEQ, label : "Judgement SEQ" },
  { value : constants.COMPARATIVE, label : "Comparative Feedback" },
  { value : constants.COMPARATIVE_SEQ, label : "Comparative Feedback SEQ" },
  { value : constants.PASS_FAIL, label : "Pass/Fail" },
  { value : constants.PASS_FAIL_SEQ, label : "Pass/Fail SEQ" },
  { value : constants.INDIVIDUAL, label : "Individual Feedback" },
  { value : constants.INDIVIDUAL_SEQ, label : "Individual Feedback SEQ" }
];

module.exports.roles = {
  list     : [constants.ASSESSOR, constants.ASSESSEE],
  assessor : constants.ASSESSOR,
  assessee : constants.ASSESSEE
};

module.exports.publicationStates = {
  list      : [constants.DRAFT, constants.PUBLISHED, constants.ARCHIVED],
  draft     : constants.DRAFT,
  published : constants.PUBLISHED,
  archived  : constants.ARCHIVED
};
