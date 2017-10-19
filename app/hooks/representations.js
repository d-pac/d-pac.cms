'use strict';

const P = require('bluebird');
const keystone = require('keystone');

const representationsService = require('../services/representations');
const assessmentsService = require("../services/assessments");
const documentsService = require("../services/documents");

const handleHook = require('./helpers/handleHook');

function setIsInComparison(comparison) {
  return P.resolve(representationsService.collection.model.update({
    _id: {
      $in: [comparison.representations.a, comparison.representations.b]
    }
  }, {isInComparison:true}, { multi: true }));
}

function removeRepresentationsForDocument(document) {
  return representationsService.list({
    document: document.id
  })
    .mapSeries((representation) => representation.remove());
}

function renameRepresentation(representation) {
  if (representation.__original
    && representation.assessment.equals(representation.__original.assessment)
    && representation.document.equals(representation.__original.document)) {
    return P.resolve(representation);
  }

  return P.props({
    assessment: assessmentsService.retrieve({_id: representation.assessment}),
    document: documentsService.retrieve({_id: representation.document})
  })
    .then((values) => {
      representation.name = assessmentsService.getName(values.assessment) + " - " + documentsService.getName(values.document);
      return representation;
    });
}

function updateRepresentationNames(document) {
  return representationsService.list({
    document: document.id
  })
    .mapSeries((representation) => representation.save());
}

module.exports.init = function () {
  keystone.list('Representation').schema.pre('save', handleHook(renameRepresentation));

  keystone.list('Comparison').schema.post('save', handleHook(setIsInComparison));

  keystone.list('Document').schema.post('save', handleHook(updateRepresentationNames));
  keystone.list('Document').schema.pre('remove', handleHook(removeRepresentationsForDocument));
};
