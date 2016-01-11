"use strict";
const _ = require( 'lodash' );
const debug = require( "debug" )( "dpac:api.feedback" );
const errors = require( 'errors' );
const service = require( "../../services/feedback" );
const Controller = require( "./helpers/Controller" );
const base = new Controller( service );
module.exports = base.mixin();

module.exports.includeFeedback = ( req,
                                   res,
                                   next )=>{

  debug( '#includeFeedback' );
  const documents = base.getResultsByType( res, 'representations' )
    .map( ( representation ) =>{
      return _.get( representation, [ 'document', '_id' ] );
    } );

  base.handleResult( service.listByDocuments( {
    author: req.params._id
  }, documents ), res, next )
};

module.exports.listByRepresentation = ( req,
                                        res,
                                        next ) =>{
  base.handleResult( service.listByRepresentation( {
      representation: req.params.representation
    } )
    .map( ( feedbackItem ) =>{
      feedbackItem = feedbackItem.toJSON();
      feedbackItem.author = feedbackItem.author.anonymized;
      return feedbackItem;
    } ), res, next );
};
