'use strict';

var debug = require('debug')('dpac:api.users.middleware');

exports.parseUserId = function( req,
                                res,
                                next ){
  debug('parseUserId');
  var userId;
  if( 'undefined' !== typeof req.params.id ){
    if( req.params.id === 'me' ){
      userId = req.user.id;
    }else{
      userId = req.params.id;
    }

  }
  res.locals.user = {
    id : userId
  };
  next();
};

exports.requireSelf = function( req,
                                res,
                                next ){
  debug('requireSelf');
  var id = res.locals.user.id;
  if( req.user.isAdmin || (id && id === req.user.id) ){
    next();
  }else{
    res.send( 401, {
      message : "Not allowed",
      status  : 401
    } );
  }
};
