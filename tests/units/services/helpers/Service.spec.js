'use strict';

const _ = require( 'lodash' );
const expect = require( 'must' );
const P = require( 'bluebird' );
const sinon = require( 'sinon' );
const Mongoose = require( 'mongoose' ).Mongoose;
const mongoose = new Mongoose();
const mockgoose = require( 'mockgoose' );

const Subject = require( '../../../../app/services/helpers/Service' );
const fixtures = require( './fixtures' );
let collections;
const values = fixtures[ "service-values" ];

before( function( done ){
  mockgoose( mongoose ).then( function(){
    mongoose.connect( 'mongodb://localhost/ServiceTest', function( err ){
      collections = fixtures[ "service-collections" ]( mongoose );
      done( err );
    } );
  } );
} );

describe( '/services/helpers/Service', function(){
  describe( 'spec', function(){
    it( 'should run', function(){
      expect( true ).to.be.true();
    } );
  } );
  describe( 'new Service(collection)', function(){
    let usersService;
    beforeEach( function(){
      usersService = new Subject( collections.User );
    } );
    afterEach( function(){
      mockgoose.reset();
    } );
    describe( '.collection', function(){
      it( 'should be set', function(){
        expect( usersService.collection ).to.equal( collections.User );
      } );
    } );
    describe( '.create', function(){
      describe( '(Object)', function(){
        it( 'should create a document', function( done ){
          const actual = usersService.create( values.users[ "name as an object" ] );
          expect( actual.then ).to.be.a.function();
          actual.then( function( document ){
            const keys = _.keys( document.toObject() );
            [ 'name', '_id', '__v' ].forEach( function( prop ){
              expect( keys ).to.include( prop );
            } );
            return null;
          } )
            .then( done, done );
        } );
      } );
      describe( '(V<Object>)', function(){
        it( 'should create all documents', function( done ){
          usersService.create( values.users.list )
            .then( function(){
              return usersService.count()
            } )
            .then( function( usersNum ){
              expect( usersNum ).to.equal( values.users.list.length );
              return null;
            } )
            .then( done, done );
        } );
      } );
    } );
    describe( '.retrieve', function(){
      describe( '({_id:id})', function(){
        it( 'should retrieve the correct document', function( done ){
          const expected = values.users[ "name as an object" ];
          usersService.create( values.users.list )
            .then( function(){
              return usersService.retrieve( {
                _id: expected._id
              } );
            } )
            .then( function( actual ){
              expect( actual.id ).to.equal( expected._id );
              return null;
            } )
            .then( done, done );
        } );
      } );
      describe( '({_id:id, fields: fields})', function(){
        it( 'should only return the requested `fields`', function( done ){
          const expected = values.users[ "name as an object" ];
          usersService.create( values.users.list )
            .then( function(){
              return usersService.retrieve( {
                _id: expected._id,
                fields: '_id'
              } );
            } )
            .then( function( actual ){
              const obj = actual.toObject();
              expect( obj ).keys( [ '_id' ] );
              return null;
            } )
            .then( done, done );
        } );
      } );
    } );
    describe( '.count', function(){
      describe( '()', function(){
        it( 'should count all documents in the collection', function( done ){
          usersService.create( values.users.list )
            .then( function(){
              return usersService.count();
            } )
            .then( function( num ){
              expect( num ).to.equal( values.users.list.length );
            } )
            .then( done, done );
        } );
      } );
      describe( '(condition)', function(){
        it( 'should only count the documents that match `condition`', function( done ){
          usersService.create( values.users.list )
            .then( function(){
              return usersService.count( {
                isAdmin: true
              } );
            } )
            .then( function( num ){
              const admins = _.filter( values.users.list, ( u ) => u.isAdmin );
              expect( num ).to.equal( admins.length );
            } )
            .then( done, done );
        } );
      } );
    } );
    describe( '.listById', function(){
      describe( '(V<String>)', function(){
        it( 'should return the documents with corresponding ids', function( done ){
          const fx = [];
          _.times( 100, function(){
            const id = new mongoose.Types.ObjectId();
            fx.push( {
              _id: id.toJSON()
            });
          } );
          const ids = _.sampleSize(fx, _.random(4, 10)).map(item=>item._id);

          usersService.create(fx)
            .then(function(  ){
              return usersService.listById(ids);
            })
            .then(function( users ){
              ids.forEach(function( id ){
                const found = _.find(users, user=>user.id === id);
                expect(!!found).to.be.true();
              });
              return null;
            })
            .then(done, done);
        } );
      } );
      describe( '(String)', function(){
        it( 'should return the document with the corresponding id', function( done ){
          const fx = [];
          _.times( 100, function(){
            const id = new mongoose.Types.ObjectId();
            fx.push( {
              _id: id.toJSON()
            });
          } );
          const id = _.sample(fx)._id;

          usersService.create(fx)
            .then(function(  ){
              return usersService.listById(id);
            })
            .then(function( users ){
              expect(users).to.be.an.array();
              expect(users[0].id).to.equal(id);
              return null;
            })
            .then(done, done);
        } );
      } );
    } );
  } );
} );
