'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection(process.env.MONGO_URI);

autoIncrement.initialize(connection);
module.exports.plugin= autoIncrement.plugin;
