'use strict';

var constants = module.exports = {
  JUDGEMENT : 'judgement',
  JUDGEMENT_SEQ : 'judgementSEQ',
  COMPARATIVE : 'comparative',
  COMPARATIVE_SEQ : 'comparative_SEQ',
  PASS_FAIL : 'passfail',
  PASS_FAIL_SEQ: 'passfailSEQ',
  INDIVIDUAL : 'individual',
  INDIVIDUAL_SEQ : 'individualSEQ'
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
