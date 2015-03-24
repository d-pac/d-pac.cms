"use strict";

module.exports = function registerDefaultRoutes( baseUrl,
                                                 app,
                                                 opts ){

  var router = app.route( baseUrl );
  if( opts.all ){
    router = router.all( opts.all );
  }

  var controller = opts.controller;
  router.get( controller.list );
  router = app.route( baseUrl + "/:_id" )
    .get( controller.retrieve )
    .patch( controller.update )
    .post( controller.create )
    .delete( controller.remove );
  return router;
};
