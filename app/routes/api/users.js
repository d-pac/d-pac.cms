"use strict";

var debug = require( "debug" )( "dpac:api.users" );
var _ = require( 'lodash' );

var service = require( "../../services/users" );
var comparisonsService = require( "../../services/comparisons" );
var notesService = require( '../../services/notes' );

var Controller = require( "./helpers/Controller" );
var base = new Controller( service );
module.exports = base.mixin();

module.exports.listAssessments = function( req,
                                           res,
                                           next ){
  debug( "#listAssessments" );
  base.handleResult( service.listAssessments( req.params.role, {
    _id: req.params._id
  } ), res, next );
};

module.exports.listComparisons = function( req,
                                           res,
                                           next ){
  debug( "#listComparisons" );

  var userId = req.params._id;
  var response = { included: [] };
  base.handleResult( service.listComparisons( {
    _id: userId
  } ).then( function( comparisons ){
    response.data = comparisons;
    return comparisonsService.listRepresentationsForComparisons( comparisons );
  } ).then( function( representations ){
    response.included = response.included.concat( representations );
    return representations;
  } ).then( function( representations ){
    var documentIds = _.chain( representations ).pluck( "document" ).pluck( "_id" ).value();
    return notesService.listByDocuments( {
      author: userId
    }, documentIds );
  } ).then( function( notes ){
    response.included = response.included.concat( notes );
    return notes;
  } ).then( function(){
    return response;
  } ), res, next, true );
};

module.exports.listNotes = function( req,
                                     res,
                                     next ){
  debug( "#listNotes" );
  base.handleResult( service.listNotes( {
    _id: req.params._id
  } ), res, next );
};
