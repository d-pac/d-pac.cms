'use strict';
const _ = require('lodash');
const comparisonsService = require('../services/comparisons');
const Comparison = comparisonsService.collection.model;
const representationService = require('../services/representations');
const P = require('bluebird');
const log = _.partial(console.log, require('path').basename(__filename) + ':');
const destination = "5910e6f9f4ff422200b8dfce";
const duplicates = [
  "5910e6f6f4ff422200b8dfbe",
  "5910e6f9f4ff422200b8dfcc",
  "5910e6faf4ff422200b8dfda",
  "5910e6f8f4ff422200b8dfc8",
  "5910e6faf4ff422200b8dfdc",
  "5910e6f7f4ff422200b8dfc2",
  "5910e6f8f4ff422200b8dfca",
  "5910e6ecf4ff422200b8dfbc",
  "5910e6faf4ff422200b8dfde",
  "5910e6fcf4ff422200b8dfe0",
  "5910e6f8f4ff422200b8dfc7",
  "5910e6f8f4ff422200b8dfc4",
  "5910e6faf4ff422200b8dfd6",
  "5910e6f9f4ff422200b8dfd4",
  "5910e6faf4ff422200b8dfd8",
  "5910e6f7f4ff422200b8dfc0",
  "5910e6f9f4ff422200b8dfd0",
];
/*
 - get a list of all the comparisons where one of the values from `duplicates` is used
 - iterate over all comparisons
 - if the other representation is NOT a duplicate and NOT `destination`
 - change the duplicate to `destination`
 - save the comparison
 - else
 - remove the comparison

 */
module.exports = function (done) {
  if (process.env.INSTANCE !== "p0") {
    throw new Error("debugging");
  }

  const selections = {};

  comparisonsService.list({
    $or: [
      {"representations.a": {$in: duplicates}},
      {"representations.b": {$in: duplicates}}
    ]
  })
    .map(function (comparison) {
      const cID = comparison.id;
      const idA = comparison.representations.a.toString();
      const idB = comparison.representations.b.toString();
      const duplicateA = duplicates.indexOf(idA) > -1 || idA === destination;
      const duplicateB = duplicates.indexOf(idB) > -1 || idB === destination;
      if (duplicateA && duplicateB) {
        log(cID, "both a duplicate -> remove");
        return comparison.remove;
      }
      if (duplicateA) {
        log(cID, "duplicate 'A' -> save");
        comparison.representations.a = destination;
        if(comparison.data.selection && comparison.data.selection.toString()===idA){
          selections[comparison.id] = destination;
        }
      } else {
        log(cID, "duplicate 'B' -> save");
        comparison.representations.b = destination;
        if(comparison.data.selection && comparison.data.selection.toString()===idB){
          selections[comparison.id] = destination;
        }
      }
      return comparison.save;
    })
    .mapSeries((handler)=>handler())
    .then(function (list) {
      log(`Processed ${list.length} comparisons`);
      return null;
    })
    .then(function () {
      return Object.keys(selections);
    })
    .mapSeries(function (key) {
      return Comparison.update({_id: key}, {"data.selection":selections[key]});
    })
    .then(function (list) {
      log(`Updated ${list.length} comparison selections`);
      return null;
    })
    .then(function () {
      return representationService.list({_id: {$in: duplicates}});
    })
    .mapSeries(function (representation) {
      return representation.remove();
    })
    .then(function (list) {
      log(`Removed ${list.length} representations`);
      return null;
    })
    .asCallback(done);
    // .then(function () {
    //   throw new Error('debugging');
    // })
    // .catch(function (err) {
    //   throw err;
    // });
};
