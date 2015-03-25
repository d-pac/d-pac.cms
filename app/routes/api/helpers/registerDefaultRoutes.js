"use strict";

module.exports = function registerDefaultRoutes( baseUrl,
                                                 app,
                                                 opts ){
  var controller = opts.controller;
  var listRouter = app.route( baseUrl );
  if( opts.all ){
    listRouter = listRouter.all( opts.all );
  }
  listRouter.get( controller.list )
    .post( controller.create );

  var resourceRouter = app.route( baseUrl + "/:_id" );
  if( opts.all ){
    resourceRouter.all( opts.all );
  }
  resourceRouter.get( controller.retrieve )
    .patch( controller.update )
    .delete( controller.remove );
  return {
    list      : listRouter,
    resources : resourceRouter
  };
};
