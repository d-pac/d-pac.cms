"use strict";

const keystone = require('keystone');

const {get} = require('lodash');
const debug = require("debug")("dpac:api.representations");

const service = require("../../services/representations");
const Controller = require("./helpers/Controller");
const mime = require('mime');
const base = new Controller(service);

const documentsService = require('../../services/documents');
const usersService = require('../../services/users');
const errors = require('errors');

module.exports = base.mixin();

function getMimetype(filename) {
  return mime.lookup(filename);
}

module.exports.list = function (req, res, next) {
  base.handleResult(base.list(req)
    .map(function (representation) {
      representation = representation.toJSON();
      const owners = get(representation, ["document", "owner"], []);
      let match = owners.some(function (owner) {
        return owner.equals(req.user._id);
      });

      let qFilter = get(req, ['query', 'filter'], '');
      if (qFilter) {
        try {
          qFilter = JSON.parse(qFilter);
        } catch (err) {
          debug('Error: filter is not JSON parseable', qFilter);
        }
      }
      if (!match) {
        if (qFilter.assessment) {
          return usersService.isPAM(req.user._id, qFilter.assessment)
            .then((isPAM) => {
              if (!isPAM) {
                delete representation.document.originalName;
              }
              return representation;
            });
        }
        delete representation.document.originalName;
      }
      return representation;
    }), res, next, {depopulate: false});
};

module.exports.retrieve = (req,
                           res,
                           next) => {
  base.handleResult(base.retrieve(req), res, next, {depopulate: false});
};

module.exports.create = (req,
                         res,
                         next) => {
  debug('#create');
  /*
   req.files.file: {
   buffer,
   encoding,
   extension,
   fieldname,
   mimetype,
   name:
   originalname,
   path
   }
   */
  const file = req.files.file;
  let created;
  const locked = keystone.uploadLocks || {};
  const lockId = req.user.id + "-" + req.body.assessment;
  if (locked[lockId]) {
    return base.handleResult(new errors.Http403Error("processing user upload for this assessment"), res, next, {depopulate: false});
  }
  locked[lockId] = true;
  keystone.uploadLocks = locked;
  base.handleResult(
    service.listForUser(req.user.id)
      .then(function (representations) {
        const found = representations.some((representation) => representation.assessment.toString() === req.body.assessment);
        if (found) {
          throw new errors.Http403Error("only one upload per assessee");
        }
        return null;
      })
      .then(function () {
        return documentsService.create({
          owner: req.user.id,
          file: {
            source: file.path,
            filetype: getMimetype(file.originalname),
            filename: file.name,
            originalname: file.originalname,
            size: file.size
          }
        });
      })
      .then((document) => {
        created = document;
        return service.create({
          assessment: req.body.assessment,
          document: document.id
        });
      })
      .then((representation) => {
        representation.document = created;
        return representation;
      })
      .finally(() => {
        delete keystone.uploadLocks[lockId];
        return null;
      })
    , res, next, {depopulate: false});
};

module.exports.update = function (req,
                                  res,
                                  next) {
  const file = req.files.file;
  base.handleResult(documentsService.update({
      _id: req.body.document,
      file: {
        source: file.path,
        filetype: getMimetype(file.originalname),
        filename: file.name,
        originalname: file.originalname,
        size: file.size
      }
    })
      .then((/*document*/) => {
        return service.retrieve({
          _id: req.params._id
        });
      })
      .then((representation) => {
        representation.markModified('document');
        return representation.save();
      })
    , res, next, {depopulate: false});
};
