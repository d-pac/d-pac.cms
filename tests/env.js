/* global run:false */

'use strict';
var debug = require( "debug" )( "dpac:tests:env" );
var TEST_ENV = 'test';
if( process.env.NODE_ENV !== TEST_ENV ){
  throw new Error( 'Incorrect NODE_ENV:' + process.env.NODE_ENV );
}
var path = require( 'path' );
var url = require( 'url' );
var _ = require( 'lodash' );
var P = require( 'bluebird' );
P.onPossiblyUnhandledRejection( function( err ){
  throw err;
} );
var propsParser = P.promisifyAll( require( 'properties' ) );

function getConfig(){
  debug( '.env configuration - load requested' );
  if( module.exports.config ){
    return P.resolve( module.exports.config );
  }
  return propsParser.parseAsync( path.resolve( __dirname, '../env/.env.' + TEST_ENV ), { path: true } )
    .then( function( config ){
      debug( '.env configuration - load completed' );
      config.API_URL = config.ROOT_URL + '/api';
      module.exports.config = config;
    } )
    .catch( function( err ){
      debug( 'ERR:', err );
      throw err;
    } );
}

function getApp(){
  debug( 'application - initialization requested' );
  if( module.exports.app ){
    return P.resolve( module.exports.app );
  }

  return new P( function( resolve,
                          reject ){
    module.exports.app = require( '../app/server' );
    var port = module.exports.app.get( 'port' );
    var mongoUri = module.exports.app.get( 'mongo uri' );
    if( String( port ) !== String( module.exports.config.PORT ) ){
      reject( new Error( 'Incorrect PORT:' + port ) );
    }
    if( mongoUri !== module.exports.config.MONGO_URI ){
      reject( new Error( 'Incorrect MONGO_URI:' + mongoUri ) );
    }
    module.exports.services = require( '../app/services' );
    debug( 'application - initialization completed' );
    resolve();
  } );
}

function destroyDatabase(){
  debug( 'database - destruction requested' );
  return new P( function( resolve ){
    var mongoose = module.exports.app.get( 'mongoose' );
    var parsedUrl = url.parse( module.exports.config.MONGO_URI );
    _.each( mongoose.connections, function( conn ){
      if( '/' + conn.name === parsedUrl.pathname ){
        conn.db.dropDatabase();
      }
    } );
    debug( 'database - destruction completed' );
    resolve();
  } );
}

function resetDatabase(){
  debug( 'database - reset requested' );
  return P.map( _.values( module.exports.app.lists ), function( list ){
    return list.model.remove( {} );
  }, { concurrency: 1 } )
    .then( function( lists ){
      debug( 'database - reset completed' );
    } );
}

getConfig()
  .then( getApp )
  .then( destroyDatabase )
  .then( function(){
    debug( 'application - startup requested' );
    return new P( function( resolve ){
      debug( 'application - startup completed' );
      module.exports.app.start( resolve );
    } );
  } )
  .then( run )
  .catch( function( err ){
    debug( 'Error occurred:', err );
    run( err );
  } );

after( function( done ){
  destroyDatabase().then( done );
} );

module.exports.setup = function(){
  return resetDatabase();
};
