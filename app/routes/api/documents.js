"use strict";

// var debug = require( "debug" )( "dpac:api.documents" );

const service = require( "../../services/documents" );
const Controller = require( "./helpers/Controller" );
const base = new Controller( service );
const errors = require( "errors" );
const path = require( 'path' );
const P = require( 'bluebird' );

module.exports = base.mixin();

module.exports.retrieveMedia = function( req,
                                         res,
                                         next ){
  const rid = req.params.rid;
  const p = service.list( {
    _rid: rid
  } )
    .then( function( result ){
      if( !result.length ){
        return P.reject( new Error( 'Not found' ) );
      }
      return result[ 0 ];
    } )
    .then( function( document ){
      if( document.ext !== `.${req.params.ext}` ){
        return P.reject( new Error( 'Incorrrect extension' ) );
      }
      return P.fromCallback( function( callback ){
        const filePath = document.file.path.indexOf( document.file.filename ) < 0
            ? path.join( document.file.path, document.file.filename )
            : document.file.path
          ;
        res.sendFile( path.resolve( filePath ), callback );
      } )
        .catch( ( err )=>{
          console.error(err);
          return P.reject( new Error( 'Could not read file',  ) );
        } );
    } )
    .catch( ( err )=>{
      console.error( err );
      return next( new errors.Http404Error() );
    } );
};
