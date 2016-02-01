"use strict";

const mongoose = require( "mongoose" );
const autoIncrement = require( "mongoose-auto-increment" );

const connection = mongoose.createConnection( process.env.MONGO_URI );

autoIncrement.initialize( connection );
module.exports.plugin = autoIncrement.plugin;
module.exports.setCount = function(opts){
  const IdentityCounter = connection.model('IdentityCounter');
  return IdentityCounter.findOneAndUpdate(
    { model: opts.model, field: opts.field},
    { count: opts.count }
  );
};
