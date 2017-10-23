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
  }, {isInComparison: true}, {multi: true}));
}

function removeRepresentationsForDocument(document) {
  return representationsService.list({
    document: document.id
  })
    .mapSeries((representation) => representation.remove());
}

function updateRepresentationNamesForDocument(document, diff, done) {
  // the document.name is also automatically created, so we won't be using diff here
  let docName = document.name;
  return representationsService.list({
    document: document.id
  })
    .mapSeries((representation) => {
      return assessmentsService.retrieveLean({
        _id: representation.assessment
      })
        .then((assessment)=>{
          representation.name = assessment.name + " - " + docName;
          return representation.save();
        });
    })
    .asCallback(done);
}

function updateRepresentationNamesForAssessment(assessment, diff, done) {
  return representationsService.list({
    assessment: assessment.id
  })
    .mapSeries((representation) => {
      representation.name = assessment.name + " - " + representation.document.name;
      return representation.save();
    })
    .asCallback(done);
}

function setRepresentationName(representation, diff, done){
  return P.props({
    document: documentsService.retrieve({_id:representation.document}),
    assessment: assessmentsService.retrieveLean({_id: representation.assessment})
  })
    .then((values)=>{
      representation.name = values.assessment.name + " - " + values.document.name;
      return representation;
    })
    .asCallback(done);
}

module.exports.init = function () {

  // keystone.list('Representation').schema.pre('save', handleHook(renameRepresentation));
  keystone.list('Representation').events.on('change:document', setRepresentationName);
  keystone.list('Representation').events.on('change:assessment', setRepresentationName);

  keystone.list('Comparison').schema.post('save', handleHook(setIsInComparison));

  keystone.list('Assessment').events.on('changed:name', updateRepresentationNamesForAssessment);
  keystone.list('Document').events.on('changed:name', updateRepresentationNamesForDocument);
  keystone.list('Document').schema.pre('remove', handleHook(removeRepresentationsForDocument));
};
