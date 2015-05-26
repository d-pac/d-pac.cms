"use strict";

var keystone = require( 'keystone' );
var Page = keystone.list( 'Page' );

module.exports = function( done ){
  Page.model.findOne( {
    slug: 'homepage'
  } ).exec( function( err,
                      result ){
    if( result ){
      console.log( "Homepage already exists in the database." );
      return done();
    }
    var homepage = new Page.model( {
      "title": "Welkom",
      "state": "published",
      "name": "cms-welcome",
      "body": "<p>Dit is een onderdeel van de d-pac tool.</p>"
    } );
    homepage.save( function( err ){
      if( err ){
        console.error( "Error adding homepage to the database:" );
        console.error( err );
        return done( err );
      }

      homepage.slug = "homepage";
      homepage.save(function (err){
        if( err ){
          console.error( "Error setting homepage slug:" );
          console.error( err );
          return done( err );
        }
        console.log( "Added default homepage to the database." );
        done();
      });

    } );

  } );
};
