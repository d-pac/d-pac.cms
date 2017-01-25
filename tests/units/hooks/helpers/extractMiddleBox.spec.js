'use strict';

const _ = require( 'lodash' );
const expect = require( 'must' );
const P = require( 'bluebird' );
const sinon = require( 'sinon' );

const subject = require( '../../../../app/hooks/helpers/extractMiddleBox' );

describe( '/hooks/helpers/extractMiddleBox', function(){
  describe( 'spec', ()=>{
    it( 'should run', ()=> expect( true ).to.be.true() );
  } );

  describe( 'module', function(){
    it( 'should expose a function', ()=>expect( subject ).to.be.a.function() );
  } );

  describe( '(list)', function(){
    it( 'should return an empty array for an empty `list`', function(){
      const actual = subject();
      expect( actual ).to.eql( [] );
    } );
    it( 'should return an empty array for a list with less than 3 elements', function(){
      _.times( 2, ( i )=>{
        const list = _.times( i, ( j )=>j );
        const actual = subject( list );
        expect( actual, `iteration ${i}` ).to.eql( [] );
      } );
    } );
    it( 'should return the lower middle element for a list with 3 elements', function(){
      const list = [ 0, 1, 2 ];
      const actual = subject( list );
      expect( actual ).to.eql( [ 1 ] );
    } );
    it( 'should return 2 middle elements for a list with 7 elements', function(){
      const list = [ 0, 1, 2, 3, 4, 5, 6 ];
      const actual = subject( list );
      expect( actual ).to.eql( [ 2, 3 ] );
    } );
    it( 'should return 3 middle elements for a list with 10 elements', function(){
      const list = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
      const actual = subject( list );
      expect( actual ).to.eql( [ 3, 4, 5 ] );
    } );
  } );
  describe( '(list, percent)', function(){
    it( 'should return 1/5 for 20%', function(){
      const list = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
      const actual = subject( list, 20 );
      expect( actual ).to.eql( [ 4, 5 ] );
    } );
    it( 'should return 6/10 for 60%', function(){
      const list = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
      const actual = subject( list, 60 );
      expect( actual ).to.eql( [ 2, 3, 4, 5, 6, 7 ] );
    } );
    it( 'should return 6/10 for 59.7%', function(){
      const list = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
      const actual = subject( list, 59.7 );
      expect( actual ).to.eql( [ 2, 3, 4, 5, 6, 7 ] );
    } );
    it( 'should return all elements for 100%', function(){
      const list = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
      const actual = subject( list, 100 );
      expect( actual ).to.eql( list );
    } );
  } );
} );
