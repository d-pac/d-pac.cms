'use strict';
var keystone = require( 'keystone' );
var objectId = require( 'mongoose' ).Types.ObjectId;
var Assessment = keystone.list( 'Assessment' );
var Persona = keystone.list( 'Persona' );
var Representation = keystone.list( 'Representation' );
var assessments = ["5458894f0138e02976448d26", "545889770138e02976448d27"];

function createAssessment( opts ){
  return Assessment.model
    .create( opts );
}

function listPersonas( assessments ){
  return Persona.model
    .find()
    .where( 'assessment' ).in( assessments )
    .lean()
    .exec();
}

function listRepresentations( assessments ){
  return Representation.model
    .find()
    .where( 'assessment' ).in( assessments )
    .lean()
    .exec();
}

/**
 * @param assessmentID
 * @param personas {Array}
 */
function duplicatePersonas( assessmentID,
                            personas ){
  var docs = [];
  personas.forEach( function( persona ){
    docs.push( {
      assessment : assessmentID,
      user       : persona.user,
      role       : persona.role
    } );
  } );
  return Persona.model.create( docs );
}

function duplicateRepresentations( assessmentID,
                                   representations ){
  var docs = [];
  representations.forEach( function( representation ){
    docs.push( {
      file       : representation.file,
      assessee   : representation.assessee,
      assessment : assessmentID
    } );
  } );
  return Representation.model.create( docs );
}

exports = module.exports = function( done ){
  var newAssessment;
  createAssessment( {
      title          : "Mixed assessment",
      state          : "published",
      description    : "Dit is een combinatie van 2 assessments",
      phases         : [
        objectId( "5423f87677177065a0887b99" ),
        objectId( "5423f87677177065a0887b9a" ),
        objectId( "5423f87677177065a0887b9b" ),
        objectId( "5423f87677177065a0887b9c" ),
        objectId( "5423f87677177065a0887b9d" ),
        objectId( "5423f87677177065a0887b9e" )
      ],
      comparisonsNum : 100
    }
  ).then( function( assessment ){
      newAssessment = assessment._id;
    } )
    .then( function(){
      return listPersonas( [assessments[0]] );
    } )
    .then( function( personas ){
      return duplicatePersonas( newAssessment, personas );
    } )
    .then( function(){
      return listRepresentations( assessments );
    } )
    .then( function( representations ){
      return duplicateRepresentations( newAssessment, representations );
    } )
    .then( function(){
      done();
    } );
};
