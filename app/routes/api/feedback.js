"use strict";
const debug = require( "debug" )( "dpac:api.feedback" );
const service = require( "../../services/feedback" );
const Controller = require( "./helpers/Controller" );
const base = new Controller( service );
module.exports = base.mixin();

module.exports.includeFeedback = ( req,
                                   res,
                                   next )=>{

  debug( '#includeFeedback' );
  const representations = base.getResultsByType( res, 'representations' )
    .map( ( representation ) =>representation._id );

  base.handleResult( service.listByRepresentations( {
    author: req.params._id
  }, representations ), res, next )
};

module.exports.listByRepresentation = ( req,
                                        res,
                                        next ) =>{
  base.handleResult( service.listByRepresentations( {}, [ req.params.representation ] ), res, next );
};
