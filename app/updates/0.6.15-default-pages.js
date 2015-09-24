"use strict";

var keystone = require( 'keystone' );
var P = require( 'bluebird' );
var Page = keystone.list( 'Page' );

var pages = [
  {
    "title": "Welkom",
    "state": "published",
    "name": "cms-welcome",
    "slug": "homepage",
    "expose": "cms",
    "body": "<p>Dit is&nbsp;het administratieve gedeelte van het d-pac framework.</p>" +
    "<p>Bekijk de <a href=\"/tool\">tool</a>&nbsp;hier.</p>"
  },

  {
    "slug": "tool-welcome",
    "title": "Welkom",
    "name": "tool-welcome",
    "expose": "api",
    "state": "published",
    "body": "<p><strong>Beste beoordelaar</strong>,</p>" +
    "<p>U bent uitgenodigd om deel te nemen aan een beoordelingsronde via D-PAC.</p>" +
    "<p>D-PAC maakt gebruik van een comparatieve beoordelingsmethode om competenties te evalueren.</p>" +
    "<p>Wanneer u voor het eerst met deze tool werkt, kunt u na het inloggen starten met het doornemen van de " +
    "<a href=\"#tutorial\">tutorial</a>." +
    "Hierin staat stap voor stap beschreven wat er van u als beoordelaar wordt verwacht.</p>"
  }
];

function createPage( pageData ){
  var q = Page.model.findOne( {
    slug: pageData.slug
  } );
  return P.promisify( q.exec, q )()
    .then( function( page ){
      if( page ){
        console.log( 'Page', page.name, 'already exists in the database.' );
        return page;
      }

      return P.promisify( Page.model.create, Page.model )( pageData )
        .then( function( page ){
          console.log( 'Added page', page.name, 'to database.' );
          return page;
        } );
    } );
}

module.exports = function( done ){

  P.resolve( pages )
    .each( createPage )
    .then( function( models ){
      done();
    } )
    .catch( done );
};
