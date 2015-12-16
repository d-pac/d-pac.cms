"use strict";

var debug = require( "debug" )( "dpac:api.users" );
var _ = require( 'lodash' );
var P = require( 'bluebird' );
var errors = require( 'errors' );
var keystone = require( 'keystone' );

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

module.exports.includeUser = ( req,
                               res,
                               next ) =>{
  base.handleResult( req.user, res, next );
};

module.exports.listIncompleteComparisons = function( req,
                                                     res,
                                                     next ){
  debug( "#listComparisons" );

  return base.handleResult( service.listIncompleteComparisons( {
    _id: req.params._id
  } ), res, next );
};

module.exports.listNotes = function( req,
                                     res,
                                     next ){
  debug( "#listNotes" );
  base.handleResult( service.listNotes( {
    _id: req.params._id
  } ), res, next );
};

module.exports.includeNotes = ( req,
                                res,
                                next ) =>{
  debug( '#includeNotes' );
  const documents = base.getResultsByType( res, 'representations' ).map( ( representation ) =>{
    return _.get( representation, [ 'document', '_id' ] );
  } );
  base.handleResult( notesService.listByDocuments( {
    author: req.params._id
  }, documents ), res, next )
};

module.exports.update = function( req,
                                  res,
                                  next ){
  let result;
  if( keystone.isDisabled( 'save_account' ) ){
    result = new errors.Http403Error( {
      message: "Not Allowed",
      explanation: 'account modification disabled'
    } );
  } else if( req.body.password !== req.body.password_confirm ){
    result = new errors.Http422Error( { explanation: 'passwords do not match' } );
  } else {
    result = base.update( req );
  }
  base.handleResult( result, res, next );

};
