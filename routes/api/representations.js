'use strict';
var service = require('../../services/representations');

module.exports.retrieveFile = function( req,
                                        res,
                                        next ){

  service.retrieve({
    _id : req.param('_id')
  } ).onResolve(function(err, doc){
    res.redirect( 307, doc.fileUrl);
  });
};
