/**
 * Created by creynder on 23/03/2017.
 */
'use strict';

const _ = require('lodash');
const expect = require('must');
const P = require('bluebird');
const sinon = require('sinon');

const subject = require('../../../app/lib/createToken');

describe('/lib/createToken', function () {
  describe('spec', () => {
    it('should run', () => expect(true).to.be.true());
  });

  describe('module', function () {
    it('should expose a function', () => expect(subject).to.be.a.function());
  });

  describe('()', function () {
    it('should return a web-safe random string of length 32', function () {
      const actual = subject();
      expect(actual).to.be.string();
      expect(actual.length).to.be(32);

    });
  });

});
