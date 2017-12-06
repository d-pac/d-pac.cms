'use strict';

const _ = require('lodash');
const P = require('bluebird');
const csv = P.promisifyAll(require("fast-csv"));

const jiraHeaders = "Summary,Issue key,Issue id,Parent id,Issue Type,Status,Project key,Project name,Project type,Project lead,Project description,Project url,Priority,Resolution,Assignee,Reporter,Creator,Created,Updated,Last Viewed,Resolved,Component/s,Due Date,Votes,Description,Environment,Watchers,Original Estimate,Remaining Estimate,Time Spent,Work Ratio,Σ Original Estimate,Σ Remaining Estimate,Σ Time Spent,Security Level,Custom field (Business Value),Custom field (Change completion date),Custom field (Change reason),Custom field (Change risk),Custom field (Change start date),Custom field (Change type),Custom field (Command Line Only),Custom field (Development),Custom field (Epic Colour),Custom field (Epic Link),Custom field (Epic Name),Custom field (Epic Status),Custom field (Impact),Custom field (Raised During),Custom field (Rank),Custom field (Request Type),Custom field (Request language),Custom field (Request participants),Custom field (Role),Satisfaction rating,Sprint,Sprint,Sprint,Sprint,Sprint,Sprint,Custom field (Story Points),Custom field (Test Sessions),Custom field (Testing Status),Custom field (URL),Custom field (User Story),Custom field (Version Number),Custom field (Wireframe),Custom field ([CHART] Date of First Response),Comment";


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
      headers: jiraHeaders.split(",")
    })
      .on("data", function (obj) {
        // console.log(data);
        output.push({
          title: obj['Issue key'],
          text: `<strong>${obj["Summary"]}</strong></<br>
            ${obj["Description"]}`
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
