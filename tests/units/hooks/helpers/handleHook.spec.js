'use strict';

const _ = require( 'lodash' );
const expect = require( 'must' );
const P = require( 'bluebird' );
const sinon = require( 'sinon' );

const subject = require( '../../../../app/hooks/helpers/handleHook' );

describe( '/hooks/helpers/handleHook', function(){
  describe( 'spec', ()=>{
    it( 'should run', ()=> expect( true ).to.be.true() );
  } );

  describe( 'module', function(){
    it( 'should expose a function', ()=>expect( subject ).to.be.a.function() );
  } );

  describe( '(handler)', function(){
    it( 'should throw when provided with anything else but a function', function(){
      expect( ()=> subject( {} ) ).to.throw( /function/i );
    } );
    it( 'should return a function', function(){
      expect( subject( _.noop ) ).to.be.a.function();
    } );
    describe( '()', function(){
      it( 'should throw if `handler` does not return a promise when called', function(){
        const actual = subject( _.noop );
        expect( ()=> actual() ).to.throw( /undefined/i );
      } );
      it( 'should call `handler`', function(){
        const handler = sinon.stub();
        handler.returns( P.resolve() );
        const f = subject( handler );
        f( _.noop );
        expect( handler.calledOnce ).to.be.true();
      } );
    } );
    describe( '(callback)', function(){
      it( 'should pass the bound context to `handler`when `handler` resolves', function(){
        const handler = sinon.stub();
        handler.returns( P.resolve() );
        const context = {};
        const f = subject( handler );
        f.call( context, _.noop );
        expect( handler.calledWithExactly( context ) ).to.be.true();
      } );
      it( 'should call `callback` w/o args when `handler` resolves', function( done ){
        const f = subject( ()=> P.resolve() );
        const callback = sinon.spy( function(){
          expect( callback.calledWithExactly( null ) ).to.be.true();
          done();
        } );
        f( callback );
      } );
      it( 'should call `callback` with `err` when `handler` rejects', function( done ){
        const err = new Error();
        const f = subject( ()=> P.reject( err ) );
        const callback = sinon.spy( function(){
          expect( callback.calledWithExactly( err ) ).to.be.true();
          done();
        } );
        f( callback );
      } );
    } );
    describe( '(obj)', function(){
      it( 'should pass `obj` to `handler`', function(){
        const handler = sinon.stub();
        handler.returns( P.resolve() );
        const f = subject( handler );
        const obj = {};
        f( obj );
        expect( handler.calledWithExactly( obj ) ).to.be.true();
      } );
      it( 'should throw `err` when `handler` rejects', function( done ){
        const err = new Error( 'will propagate' );
        const f = subject( ()=> P.reject( err ) );
        const listener = function( actual ){
          expect( actual ).to.equal( err );
          process.removeListener( 'unhandledRejection', listener );
          done();
        };
        process.on( 'unhandledRejection', listener );
        f( {} );
      } );
    } );
  } );
} );
