/**
 * Created by creynder on 23/03/2017.
 */
'use strict';

const _ = require('lodash');
const expect = require('must');
const P = require('bluebird');
const sinon = require('sinon');

const subject = require('../../../app/lib/getSafeBoolean');

describe('/lib/getSafeBoolean', function () {
  describe('spec', () => {
    it('should run', () => expect(true).to.be.true());
  });

  describe('module', function () {
    it('should expose a function', () => expect(subject).to.be.a.function());
  });

  describe('(value)', function () {
    it('should return `false` for `undefined`', function () {
      const actual = subject();
      expect(actual).to.be.false();
    });
    it('should return `false` for `null`', function () {
      const actual = subject(null);
      expect(actual).to.be.false();
    });
    it('should return `false` for `false` (boolean)', function () {
      const actual = subject(false);
      expect(actual).to.be.false();
    });
    it('should return `false` for "false" (string)', function () {
      const actual = subject("false");
      expect(actual).to.be.false();
    });
    it('should return `false` for "FALSE" (string)', function () {
      const actual = subject("false");
      expect(actual).to.be.false();
    });
    it('should return `false` for `0` (number)', function () {
      const actual = subject(0);
      expect(actual).to.be.false();
    });
    it('should return `false` for "0" (string)', function () {
      const actual = subject("0");
      expect(actual).to.be.false();
    });
    it('should return `true` for `true` (boolean)', function () {
      const actual = subject(true);
      expect(actual).to.be.true();
    });
    it('should return `true` for "true" (string)', function () {
      const actual = subject("true");
      expect(actual).to.be.true();
    });
    it('should return `true` for "TRUE" (string)', function () {
      const actual = subject("TRUE");
      expect(actual).to.be.true();
    });
    it('should return `true` for `1` (number)', function () {
      const actual = subject(1);
      expect(actual).to.be.true();
    });
    it('should return `true` for "1" (string)', function () {
      const actual = subject("1");
      expect(actual).to.be.true();
    });
  });

});
