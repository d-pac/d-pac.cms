"use strict";

var konfy = require( "konfy" );
konfy.load();

var expect = require( "must" );
var _ = require( "underscore" );

var mongoose = require( "mongoose" );
var objectId = mongoose.Types.ObjectId;
console.log( "connecting to", process.env.MONGO_URI );
mongoose.connect( process.env.MONGO_URI );

//var userNames = [
//  "102", "103", "104", "106", "107", "108",
//  "201", "208", "210", "212", "213", "214",
//  "301", "307", "310", "314",
//  "401", "403", "408", "409", "410", "411", "412", "413", "414", "415", "416", "418", "419", "420", "421", "422", "424",
//  "425",
//  "501", "502", "505", "506", "507", "508", "509", "512", "513", "515", "516", "519", "520",
//  "602", "606", "607", "608", "609", "611", "614", "615", "616",
//  "701", "703", "704", "705", "707", "710",
//  "801", "802", "803", "804", "805", "808", "810", "811", "812", "813", "814", "815", "816", "817", "818", "819", "820",
//  "821",
//  "901", "902", "903", "904", "905", "906", "909", "910", "911", "912", "914", "915", "917", "918",
//  "1001", "1002", "1003", "1005", "1006", "1008", "1009"
//];
var userNames = [
  "711", "712", "713", "714", "716", "717", "718", "719", "720", "721", "722", "723", "715", "1001"
];
var assessmentIds = [
  objectId( "5458894f0138e02976448d26" ),
  objectId( "545889770138e02976448d27" ),
  objectId( "545889960138e02976448d28" )

];

var db = mongoose.connection;
db.on( "error", console.error.bind( console, "connection error:" ) );
db.once( "open", function callback(){
  var User = mongoose.model( "users", mongoose.Schema() );
  var Persona = mongoose.model( "personas", mongoose.Schema() );
  var Representation = mongoose.model( "representations", mongoose.Schema() );
  var userIds;
  User.find()
    .where( "name.first" )
    .in( userNames )
    .lean()
    .exec()
    .then( function( users ){
      userIds = _.map( users, "_id" );
      return userIds;
    } )
    .then( function(){
      return Persona.find()
        .where( "assessment" ).in( assessmentIds )
        .where( "user" ).in( userIds )
        .remove()
        .exec();
    } ).then( function( deletedNum ){
      console.log( "Deleted", deletedNum, "personas" );
    } )
    .then( function(){
      return Representation.find()
        .where( "assessment" ).in( assessmentIds )
        .where( "assessee" ).in( userIds )
        .remove()
        .exec();
    } )
    .then( function( deletedNum ){
      console.log( "Deleted", deletedNum, "representations" );
    } )
    .then( function(){
      console.log( arguments );
      mongoose.connection.close();
    } );
} );
