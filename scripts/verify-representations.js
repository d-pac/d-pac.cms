"use strict";

var konfy = require( "konfy" );
konfy.load();

var expect = require( "must" );

var mongoose = require( "mongoose" );

mongoose.connect( process.env.MONGO_URI );

var db = mongoose.connection;
db.on( "error", console.error.bind( console, "connection error:" ) );
db.once( "open", function callback(){
  var Representation = mongoose.model( "representations", mongoose.Schema() );
  Representation.find()
    .lean()
    .exec()
    .then( function( representations ){
      representations.forEach( function( representation ){
        console.log( "Verifying:", representation._id );

        try{
          expect( representation ).to.have.property( "file" );
        } catch( err ) {
          console.log( "[Error]", "Representation", representation, "missing \"file\"" );
        }
      } );

      mongoose.connection.close();
    } );
} );
