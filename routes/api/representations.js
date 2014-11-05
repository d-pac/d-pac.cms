'use strict';
var debug = require( 'debug' )( 'dpac:api.representations' );
var service = require( '../../services/representations' );

module.exports.retrieveFile = function( req,
                                        res,
                                        next ){

  service.retrieveFull( {
    _id : req.param( '_id' )
  } ).onResolve( function( err,
                           doc ){
    if(doc){
      res.redirect( 307, doc.fileUrl );
    }else{
      next();
    }
  } );
};

module.exports.retrievePair = function( req,
                                        res,
                                        next ){
  debug("#retrievePair");
  service.retrievePair({
    assessment : req.param("assessment")
  }).onResolve(function(err, result){
    if(err){
      return next(err);
    }
    res.apiResponse("200", result);
  });
};
