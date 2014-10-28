'use strict';
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
  service.retrievePair({
    assessment : req.param("assessment")
  }).onResolve(function(err, result){
    if(err){
      return res.apiError(err);
    }
    res.apiResponse("200", result);
  });
};
