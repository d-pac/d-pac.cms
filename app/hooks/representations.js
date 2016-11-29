'use strict';

var P = require( 'bluebird' );
var keystone = require( 'keystone' );

var representationsService = require( '../services/representations' );
const assessmentsService = require("../services/assessments");
var documentsService = require("../services/documents");

const handleHook = require( './helpers/handleHook' );

function uncompareRepresentationsForComparison( comparison ){
  return P.props( {
    a: representationsService.retrieve( {
      _id: comparison.representations.a
    } ),
    b: representationsService.retrieve( {
      _id: comparison.representations.b
    } )
  } )
    .then( ( representations )=>{
      if( representations.a && representations.b ){
        return representations.a.uncompareWith( representations.b );
      }
    } );
}

function compareRepresentationsForComparison( comparison ){
  if( !comparison.isNew ){
    return P.resolve();
  }
  return P.props( {
    a: representationsService.retrieve( {
      _id: comparison.representations.a
    } ),
    b: representationsService.retrieve( {
      _id: comparison.representations.b
    } )
  } )
    .then( ( representations )=> representations.a.compareWith( representations.b ) );
}

function removeRepresentationsForDocument( document ){
  return representationsService.list( {
    document: document.id
  } )
    .mapSeries( ( representation )=>representation.remove() );
}

function renameRepresentation(representation){
  if(representation.assessment.equals(representation.__original.assessment)
    && representation.document.equals(representation.__original.document)){
    return P.resolve(representation);
  }

  return P.props({
    assessment: assessmentsService.retrieve({_id: representation.assessment}),
    document: documentsService.retrieve({_id: representation.document})
  })
    .then((values)=>{
      representation.name = assessmentsService.getName(values.assessment)+ " - " +documentsService.getName(values.document);
      return representation;
    });
}

function updateRepresentationNames( document ){
  return representationsService.list({
    document: document.id
  })
    .mapSeries((representation)=>representation.save());
}

module.exports.init = function(){
  keystone.list('Representation').schema.pre('save', handleHook(renameRepresentation));

  keystone.list( 'Comparison' ).schema.pre( 'remove', handleHook( uncompareRepresentationsForComparison ) );
  keystone.list( 'Comparison' ).schema.pre( 'save', handleHook( compareRepresentationsForComparison ) );

  keystone.list( 'Document' ).schema.post( 'save', handleHook( updateRepresentationNames ) );
  keystone.list( 'Document' ).schema.pre( 'remove', handleHook( removeRepresentationsForDocument ) );
};
