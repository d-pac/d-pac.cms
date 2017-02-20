'use strict';

const _ = require( 'lodash' );
const sinon = require( 'sinon' );
const stub = require( 'proxyquire' ).noCallThru();
const expect = require( 'must' );
const fx = require( './fixtures' );
const subject = stub( '../../../../app/hooks/helpers/filesystem', {
  fs: {
    readFile: function( file,
                        opts,
                        callback ){

    },
    statSync: function( file ){

    },
    rename: function( src,
                      dest,
                      callback ){

    },
    unlink: function( file,
                      callback ){

    }
  },
  "extract-zip": function( file,
                           args,
                           callback ){
    fx["extract-zip"][type](args.file, args.opts, callback);
  },
  "node-dir": {
    files: function( opts,
                     callback ){

    }
  },
  rimraf: function( dir,
                    callback ){

  }
} );

describe.skip( '/hooks/helpers/filesystem', function(){

  describe( 'spec file', function(){
    it( 'should be found', function(){
      expect( true ).to.be.true();
    } );
  } );

  describe( '.extractZipfile', function(){
    it( 'should resolve to `undefined`', function( done ){
      subject.extractZipfile( "noop", { temp: "" } )
        .then( function( result ){
          expect( result ).to.be.undefined();
          done();
        } );
    } );
    it( 'should fail silently', function( done ){
      subject.extractZipfile( "fail", { temp: "" } )
        .then( function( result ){
          expect( result ).to.be.undefined();
          done();
        } );
    } );
  } );

} );
