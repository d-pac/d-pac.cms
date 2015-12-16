"use strict";

module.exports = function registerDefaultRoutes( baseUrl,
                                                 app,
                                                 opts ){
  var controller = opts.controller;
  var listRouter = app.route( baseUrl );
  var resourceRouter = app.route( baseUrl + "/:_id" );

  if( opts['pre:all'] ){
    listRouter = listRouter.all( opts['pre:all'] );
  }
  if( opts['pre:list'] ){
    listRouter.get( opts['pre:list'] );
  }
  if( opts['pre:create'] ){
    listRouter.post( opts['pre:create'] );
  }
  if( opts['pre:all'] ){
    resourceRouter.all( opts['pre:all'] );
  }
  if( opts['pre:retrieve'] ){
    resourceRouter.get(opts['pre:retrieve']);
  }
  if(opts['pre:update']){
    resourceRouter.patch(opts['pre:update']);
  }
  if(opts['pre:remove']){
    resourceRouter.delete(opts['pre:remove']);
  }

  listRouter.get( controller.list )
    .post( controller.create );

  resourceRouter.get( controller.retrieve )
    .patch( controller.update )
    .delete( controller.remove );

  if( opts['post:all'] ){
    listRouter = listRouter.all( opts['post:all'] );
  }
  if( opts['post:list'] ){
    listRouter.get( opts['post:list'] );
  }
  if( opts['post:create'] ){
    listRouter.post( opts['post:create'] );
  }
  if( opts['post:all'] ){
    resourceRouter.all( opts['post:all'] );
  }
  if( opts['post:retrieve'] ){
    resourceRouter.get(opts['post:retrieve']);
  }
  if(opts['post:update']){
    resourceRouter.patch(opts['post:update']);
  }
  if(opts['post:remove']){
    resourceRouter.delete(opts['post:remove']);
  }

  return {
    list: listRouter,
    resources: resourceRouter
  };
};
