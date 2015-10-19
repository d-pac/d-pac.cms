"use strict";

var _ = require( "lodash" );
var keystone = require( 'keystone' );
var debug = require( "debug" )( "dpac:lib.pluginsScrobbler" );
var chalk = require( 'chalk' );
var spec = require( 'd-pac.plugins-spec' );
var path = require( 'path' );
var semver = require( 'semver' );

function init( manifest ){

  var plugins = _.reduce( manifest.dependencies, function( result,
                                                           version,
                                                           name ){
    var pkgPath = path.resolve( path.join( "node_modules", name, "package.json" ) );
    var moduleManifest = require( pkgPath );
    debug( "Parsed dependency:", name );
    result = result.concat( spec.getPlugins( moduleManifest, { allowIndependents: true } ) );
    return result;
  }, [] );

  if( _.size( plugins ) < 0 ){
    debug( chalk.yellow( "No plugins found, have they been added as a dependency to", manifest.name, "?" ) );
  } else {
    debug( chalk.green( "Plugin(s) found:" ), _.pluck( plugins, "name" ) );
  }

  var list = _.chain( plugins )
      .map( function( pluginConfig ){
        return _.merge( {
          value: pluginConfig.name,
          label: pluginConfig.label || pluginConfig.name
        }, pluginConfig );
      } )
      .groupBy( "type" )
      .value() || [];

  keystone.set( "d-pac", {
    plugins: list
  } );
}

function getByType( collection,
                    type ){
  return collection[ type ] || [];
}

function list( type ){
  return keystone.get( "d-pac" ).plugins[ type ] || [];
}

module.exports = {
  init: init,
  list: list
};
