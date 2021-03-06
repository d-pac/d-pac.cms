'use strict';

const _ = require('lodash');
const P = require('bluebird');
const csv = P.promisifyAll(require("fast-csv"));

module.exports.jsonToCSV = function jsonToCSV(data,
                                              opts) {
  opts = _.defaults({
    headers: true,
    quoteColumns: true
  }, opts);
  return csv.writeToStringAsync(data, opts);
};

module.exports.userCSVtoJson = function CSVToJson(opts) {
  const output = [];

  return new P(function (resolve,
                         reject) {
    csv
      .fromPath(opts.path, {
        headers: ["firstName", "lastName", "email", "password"],
        delimiter: ";"
      })
      .on("data", function (obj) {
        // console.log(data);
        if (obj.email || obj.firstName || obj.lastName) {
          output.push({
            name: {
              first: obj.firstName,
              last: obj.lastName
            },
            email: obj.email,
            password: obj.password
          });
        }
      })
      .on("end", function () {
        resolve(output);
      })
      .on("error", function (err) {
        reject(err);
      });
  });
};

module.exports.jiraCSVtoJSON = function jiraCSVtoJSON(opts) {
  const output = [];
  return new P(function (resolve, reject) {
    csv.fromPath(opts.path, {
      delimiter: ",",
      headers: opts.columns
    })
      .on("data", function (obj) {
        // console.log(data);
        output.push({
          title: obj['Issue key'],
          text: obj.Summary
        });
      })
      .on("end", function () {
        resolve(output);
      })
      .on("error", function (err) {
        reject(err);
      });
  });
};

module.exports.textsCSVtoJSON = function textsCSVtoJSON(opts) {
  const output = [];
  return new P(function (resolve, reject) {
    csv.fromPath(opts.path, {
      delimiter: ";",
      headers: ["title", "description"]
    })
      .on("data", function (obj) {
        // console.log(data);
        output.push({
          title: obj.title,
          text: obj.description
        });
      })
      .on("end", function () {
        resolve(output);
      })
      .on("error", function (err) {
        reject(err);
      });
  });
};
