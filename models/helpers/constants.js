"use strict";

var _ = require( "underscore" );

var constants = module.exports = {
  ASSESSOR  : "Assessor",
  ASSESSEE  : "Assessee",
  DRAFT     : "draft",
  PUBLISHED : "published",
  ARCHIVED  : "archived"
};

module.exports.roles = {
  list     : [ constants.ASSESSOR, constants.ASSESSEE ],
  assessor : constants.ASSESSOR,
  assessee : constants.ASSESSEE
};

module.exports.publicationStates = {
  list      : [ constants.DRAFT, constants.PUBLISHED, constants.ARCHIVED ],
  draft     : constants.DRAFT,
  published : constants.PUBLISHED,
  archived  : constants.ARCHIVED
};
