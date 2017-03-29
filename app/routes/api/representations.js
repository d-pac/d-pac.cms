"use strict";

const {get} = require('lodash');
const debug = require( "debug" )( "dpac:api.representations" );

const service = require( "../../services/representations" );
const Controller = require( "./helpers/Controller" );
const path = require('path');
const base = new Controller( service );

const documentsService = require( '../../services/documents' );

module.exports = base.mixin();

module.exports.list = function (req, res, next) {
  base.handleResult(base.list(req)
    .map(function (representation) {
      representation = representation.toJSON();
      const owners = get(representation, ["document", "owner"], []);
      const match = owners.some(function (owner) {
        return owner.equals(req.user._id);
      });
      if(! match){
        delete representation.document.originalName;
      }
      return representation;
    }), res, next, { depopulate: false });
};

module.exports.retrieve = ( req,
                            res,
                            next ) =>{
  base.handleResult( base.retrieve( req ), res, next, { depopulate: false } );
};

module.exports.create = ( req,
                          res,
                          next )=>{
  debug( '#create' );
  /*
   req.files.file: {
   buffer,
   encoding,
   extension,
   fieldname,
   mimetype,
   name:
   originalname,
   path
   }
   */
  const file = req.files.file;
  let created;

  base.handleResult( documentsService.create( {
      owner: req.user.id,
      file: {
        source: file.path,
        filetype: file.mimetype,
        filename: file.name,
        originalname: file.originalname,
        size: file.size
      }
    } )
    .then( ( document )=>{
      created = document;
      return service.create( {
        assessment: req.body.assessment,
        document: document.id
      } );
    } )
    .then( ( representation )=>{
      representation.document = created;
      return representation;
    } )
    , res, next, { depopulate: false } );
};

module.exports.update = function( req,
                                  res,
                                  next ){
  const file = req.files.file;
  base.handleResult( documentsService.update( {
      _id: req.body.document,
      file: {
        source: file.path,
        filetype: file.mimetype,
        filename: file.name,
        originalname: file.originalname,
        size: file.size
      }
    } )
    .then( ( /*document*/ )=>{
      return service.retrieve( {
        _id: req.params._id
      } );
    } )
    .then( ( representation )=>{
      representation.markModified( 'document' );
      return representation.save();
    } )
    , res, next, { depopulate: false } );
};
