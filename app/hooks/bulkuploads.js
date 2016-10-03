'use strict';

var keystone = require('keystone');
var _ = require('lodash');
var P = require('bluebird');
var unzip = P.promisify(require('extract-zip'));
var rimraf = P.promisify(require('rimraf'));
var fs = P.promisifyAll(require('fs'));
var dirops = P.promisifyAll(require('node-dir'));
var path = require('path');
var mime = require('mime');
var uuid = require('uuid');
var utils = require('keystone-utils');

const convertersService = require('../services/converters');
var assessmentsService = require('../services/assessments');
var documentsService = require('../services/documents');
const usersService = require('../services/users');
var Document = keystone.list('Document');
var Representation = keystone.list('Representation');
var constants = require('../models/helpers/constants');
const handleHook = require('./helpers/handleHook');

var ignored = ['.DS_Store'];

function extractZipfile(opts) {
  return unzip(opts.file, {
    dir: opts.temp
  })
    .catch(function (err) {
      console.error('ERROR:', err);
    });
}

function retrieveJSONData(opts) {
  if (!opts.json) {
    return P.resolve(false);
  }
  return fs.readFileAsync(opts.json, 'utf8')
    .then(function (jsonStr) {
      return JSON.parse(jsonStr);
    })
    .reduce(function (memo,
                      item) {
      memo[item.fileName] = item;
      return memo;
    }, {})
    ;
}

function updateDocument(document,
                        fileData,
                        opts) {
  document.title = path.basename(fileData.filename, path.extname(fileData.filename));
  document.file = {
    filename: fileData.filename,
    originalname: fileData.originalname || fileData.filename,
    path: opts.dest,
    size: fileData.stats.size,
    filetype: mime.lookup(fileData.filename)
  };
  document.host = 'local';
  return document;
}

function readDirectoryContents(opts) {
  return dirops.filesAsync(opts.temp)
    .then(function (files) {
      return files.filter(function (file) {
        const filename = path.basename(file);
        const index = ignored.indexOf(filename);
        return index < 0;
      });
    });
}

function createFileData(filepath,
                        dir) {
  var fileData = {};
  fileData.filename = path.basename(filepath);
  fileData.resolved = (dir)
    ? path.join(dir, fileData.filename)
    : filepath;
  try {
    fileData.stats = fs.statSync(fileData.resolved);
  } catch (err) {
    //file doesn't exist
    fileData.stats = {
      isFile: function () {
        return false;
      }
    };
  }
  return fileData;
}

function moveFile(src,
                  dest) {
  return fs.renameAsync(src.resolved, dest.resolved);
}

function createRepresentations(document,
                               assessments,
                               base) {
  return assessments.reduce((memo,
                             assessment)=> {
    memo[assessment.id] = new Representation.model(_.assign({}, {
      document: document.id,
      assessment: assessment.id
    }, base));
    return memo;
  }, {});
}

function findDocuments(fileData) {
  return documentsService.list({
    'file.filename': fileData.filename
  });
}

function removeFile(fileData) {
  return fs.unlinkAsync(fileData.resolved);
}

function reuseStrategy(files,
                       assessments,
                       opts) {
  files.src.originalname = files.src.filename;
  return findDocuments(files.dest)
    .then(function (documents) {
      var document = (documents && documents.length)
        ? documents[0]
        : new Document.model();
      document = updateDocument(document, files.src, opts);
      return {
        document: document,
        representations: createRepresentations(document, assessments)
      };
    });
}

function overwriteStrategy(files,
                           assessments,
                           opts) {
  files.dest.stats = files.src.stats;
  files.dest.originalname = files.src.filename;
  return P.join(
    findDocuments(files.dest),
    removeFile(files.dest)
      .then(function () {
        return moveFile(files.src, files.dest);
      }),
    function (documents) {
      var document = (documents && documents.length)
        ? documents[0]
        : new Document.model();
      document = updateDocument(document, files.dest, opts);
      return {
        document: document,
        representations: createRepresentations(document, assessments)
      };
    }
  );
}

function createStrategy(files,
                        assessments,
                        opts) {
  files.src.originalname = files.src.filename;
  return moveFile(files.src, files.dest)
    .then(function () {
      var document = updateDocument(new Document.model(), files.src, opts);
      return {
        document: document,
        representations: createRepresentations(document, assessments)
      };
    });
}

function renameStrategy(files,
                        assessments,
                        opts) {
  files.dest = createFileData(uuid.v4() + path.extname(files.src.filename), constants.directories.documents);
  files.dest.originalname = files.src.filename;
  files.dest.stats = files.src.stats;
  return moveFile(files.src, files.dest)
    .then(function () {
      var document = updateDocument(new Document.model(), files.dest, opts);
      return {
        document: document,
        representations: createRepresentations(document, assessments)
      };
    });
}

var strategies = {
  create: createStrategy
};
strategies[constants.RENAME] = renameStrategy;
strategies[constants.REUSE] = reuseStrategy;
strategies[constants.OVERWRITE] = overwriteStrategy;

/*
 conflict resolution:
 overwrite: reuse document and overwrite the file
 reuse: reuse the document discard new file
 rename: create a new document and rename the file
 */

function parseJSON(jsonData,
                   mapByFilename) {
  _.forEach(jsonData, function (item) {
    const representationsByAssessment = mapByFilename.representations[item.fileName];
    _.each(representationsByAssessment, (representation,
                                         assessmentId)=> {
      if (item.closeTo) {
        representation.closeTo = mapByFilename.representations[item.closeTo][assessmentId].id;
      }
      representation.ability.value = _.get(item, "ability.value", null);
      representation.ability.se = _.get(item, "ability.se", null);
      representation.rankType = item.rankType;
    });
  });
}
function mapToArray(mapByFilename) {
  const representationList = _.reduce(mapByFilename.representations, (memo,
                                                                      representationsByAssessment)=> {
    return memo.concat(_.values(representationsByAssessment));
  }, []);
  return _.values(mapByFilename.documents).concat(representationList);
}
function createRepresentationsFromFiles(bulkupload,
                                        jsonData,
                                        assessments,
                                        opts) {
  return readDirectoryContents(opts)
    .reduce(function (memo,
                      filepath) {
      const files = {
        src: createFileData(filepath)
      };
      if (!files.src.stats.isFile()) {
        return memo;
      }
      files.dest = createFileData(filepath, opts.dest);
      var strategy = ( files.dest.stats.isFile() )
        ? strategies[bulkupload.conflicts]
        : strategies.create;

      return strategy(files, assessments, opts)
        .then(function (result) {
          var filename = result.document.file.originalname;
          memo.documents[filename] = result.document;
          memo.representations[filename] = result.representations;
          return memo;
        });
    }, {
      documents: {},
      representations: {}
    })
    .then(function (mapByFilename) {
      if (jsonData) {
        parseJSON(jsonData, mapByFilename);
      }
      return mapByFilename;
    })
    .then(mapToArray)
    .each(function (doc) {
      return doc.save();
    });
}

function createRepresentationsFromJSON(bulkupload,
                                       jsonData,
                                       assessments,
                                       opts) {
  return documentsService.list({
    file: {
      originalname: {$in: _.keys(jsonData)}
    }
  })
    .reduce(function (memo,
                      document) {
      const name = document.file.originalname;
      memo.documents[name] = document;
      memo.representations[name] = createRepresentations(document, assessments);
      return memo;
    }, {
      documents: {},
      representations: {}
    })
    .then(function (mapByFilename) {
      parseJSON(jsonData, mapByFilename);
      return mapByFilename;
    })
    .then(mapToArray)
    .each(function (doc) {
      return doc.save();
    });
}

function cleanup(bulkupload,
                 opts) {
  return P.try(function () {
    if (opts.file) {
      return removeFile({resolved: opts.file});
    }
    return null;
  })
    .then(function () {
      if (opts.json) {
        return removeFile({resolved: opts.json});
      }
      return null;
    })
    .then(function () {
      if(opts.temp){
        return rimraf(opts.temp);
      }
      return null;
    })
    .then(function () {
      bulkupload.completed = true;
    })
    ;
}

function handleRepresentations(bulkupload) {
  const zipfile = _.get(bulkupload, ['zipfile', 'filename'], false);
  const jsonfile = _.get(bulkupload, ['jsonfile', 'filename'], false);

  if (!zipfile && !jsonfile) {
    return P.reject(new Error('Zipfile -or- jsonfile is required!'));
  }
  let opts = {};

  if (jsonfile) {
    opts.json = path.resolve(constants.directories.bulk, jsonfile);
  }

  let p = P.props({
    json: retrieveJSONData(opts),
    assessments: assessmentsService.listById(bulkupload.assessment)
  });
  if (zipfile) {
    opts.dest = constants.directories.documents;
    opts.temp = path.resolve(constants.directories.bulk, bulkupload._rid.toString());
    opts.file = path.resolve(constants.directories.bulk, zipfile);
    p = p.then(function (data) {
      return extractZipfile(opts)
        .then(function (unused) {
          return createRepresentationsFromFiles(bulkupload, data.json, data.assessments, opts);
        })
        .catch(function (err) {
          return P.reject(err);
        });
    });
  } else {
    p = p.then(function (data) {
      return createRepresentationsFromJSON(bulkupload, data.json, data.assessments, opts);
    });
  }

  return p.then(function () {
    return cleanup(bulkupload, opts);
  });
}

function parseUserData(opts) {
  return convertersService.userCSVtoJson(opts);
}

function handleUsers(bulkupload) {
  if (!bulkupload.csvfile || !bulkupload.csvfile.filename) {
    return P.reject(new Error('CSV file is required!'));
  }

  const opts = {
    path: path.resolve(path.join(constants.directories.bulk, bulkupload.csvfile.filename))
  };

  return parseUserData(opts)
    .map((raw)=> {
      var emailRegExp = new RegExp('^' + utils.escapeRegExp(raw.email) + '$', 'i');
      return usersService.list({email: emailRegExp})
        .then((users)=> {
          let user;
          if (users.length) {
            user = users[0];
          } else {
            if (!raw.password) {
              raw.password = "changeme";
            }
            if (bulkupload.sendInvites) {
              raw.actions = {sendInviteMail: true};
            }
            user = new usersService.collection.model(raw);
          }
          bulkupload.assessment.forEach((assessmentId)=> {
            if (bulkupload.roles.asAssessee && user.assessments.assessee.indexOf(assessmentId) < 0) {
              user.assessments.assessee.push(assessmentId);
            }
            if (bulkupload.roles.asAssessor && user.assessments.assessor.indexOf(assessmentId) < 0) {
              user.assessments.assessor.push(assessmentId);
            }
            if (bulkupload.roles.asPAM && user.assessments.pam.indexOf(assessmentId) < 0) {
              user.assessments.pam.push(assessmentId);
            }
          });
          return user.save();
        })
        .catch((err)=>P.reject(err));
    })
    .then(function () {
      return removeFile({resolved: opts.path});
    })
    .then(function () {
      bulkupload.csvfile = {
        "filename": "",
        "originalname": "",
        "path": "",
        "size": 0,
        "filetype": "0"
      };
      bulkupload.completed = true;
    });
}

function bulkuploadSavedHandler(bulkupload) {
  if (bulkupload.completed && !keystone.get('dev env')) {
    return P.reject(new Error('You cannot reuse bulk uploads. (Seriously that would mean a world of pain)'));
  }

  if (bulkupload.isNew) {
    return P.resolve();
  }

  let p;
  switch (bulkupload.uploadType) {
    case "representations":
      p = handleRepresentations(bulkupload);
      break;
    case "users":
      p = handleUsers(bulkupload);
      break;
    default:
      return P.reject(new Error('Unknown bulk upload type'));
  }

  return p.then(function () {
    bulkupload.result = "Bulk upload successfully completed.";
  })
    .catch(function (err) {
      bulkupload.result = "Bulk upload failed: " + err.message;
    });
}

module.exports.init = function () {
  keystone.list('Bulkupload').schema.pre('save', handleHook(bulkuploadSavedHandler));
};
