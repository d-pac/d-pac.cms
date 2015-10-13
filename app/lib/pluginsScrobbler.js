"use strict";

var _ = require( "lodash" );
var pluginParser = require( "d-pac.plugins-parser" );
var keystone = require( 'keystone' );

function init( config, opts ){
  var plugins = _.chain( pluginParser( opts ) )
      .map( function( pluginConfig ){
        return _.merge( {
          value: pluginConfig.name,
          label: pluginConfig.label || pluginConfig.name
        }, pluginConfig );
      } )
      .groupBy( "type" )
      .value() || [];

  keystone.set( "d-pac", _.defaults( {
    pluginsScrobbled: true,
    plugins: plugins
  }, config ) );

  return plugins;
}

function getByType( collection,
                    type ){
  return collection[ type ] || [];
}

function list( type ){
  var config = keystone.get( "d-pac" );
  if( config && config.pluginsScrobbled ){
    return getByType( config.plugins, type );
  } else {
    return getByType( init( config ), type );
  }
}

module.exports = {
  list: list
};
