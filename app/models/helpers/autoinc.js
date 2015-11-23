"use strict";

var mongoose = require( "mongoose" );
var autoIncrement = require( "mongoose-auto-increment" );

var connection = mongoose.createConnection( process.env.MONGO_URI );

autoIncrement.initialize( connection );
module.exports.plugin = autoIncrement.plugin;
module.exports.setCount = function(opts, next){
  var IdentityCounter = connection.model('IdentityCounter');
  IdentityCounter.findOneAndUpdate(
    { model: opts.model, field: opts.field},
    { count: opts.count },
    function (err) {
      if (err) return next(err);
      // Continue with default document save functionality.
      next();
    }
  );

};
