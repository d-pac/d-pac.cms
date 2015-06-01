"use strict";

module.exports = function registerDefaultRoutes( baseUrl,
                                                 app,
                                                 opts ){
  var controller = opts.controller;
  var listRouter = app.route( baseUrl );
  if( opts.all ){
    listRouter = listRouter.all( opts.all );
  }
  if( opts.list ){
    listRouter.get( opts.list );
  }
  if( opts.create ){
    listRouter.post( opts.create );
  }
  listRouter.get( controller.list )
    .post( controller.create );

  var resourceRouter = app.route( baseUrl + "/:_id" );
  if( opts.all ){
    resourceRouter.all( opts.all );
  }
  if( opts.retrieve ){
    resourceRouter.get(opts.retrieve);
  }
  if(opts.update){
    resourceRouter.patch(opts.update);
  }
  if(opts.remove){
    resourceRouter.delete(opts.remove);
  }
  resourceRouter.get( controller.retrieve )
    .patch( controller.update )
    .delete( controller.remove );
  return {
    list: listRouter,
    resources: resourceRouter
  };
};
