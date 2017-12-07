'use strict';

const keystone = require('keystone');
const _ = require('lodash');
const P = require('bluebird');
const path = require('path');
const mime = require('mime');
const uuid = require('uuid');

const assessmentsService = require('../services/assessments');
const documentsService = require('../services/documents');
const Document = keystone.list('Document');
const Representation = keystone.list('Representation');
const constants = require('../models/helpers/constants');
const handleHook = require('./helpers/handleHook');
const fsutils = require('./helpers/filesystem');
const convertersService = require('../services/converters');

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

function createRepresentations(document,
                               assessments,
                               base) {
  return assessments.reduce((memo,
                             assessment) => {
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

function reuseStrategy(files,
                       assessments,
                       opts) {
  files.src.originalname = files.src.filename;
  return findDocuments(files.dest)
    .then(function (documents) {
      let document = (documents && documents.length)
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
    fsutils.removeFile(files.dest)
      .then(function () {
        return fsutils.moveFile(files.src, files.dest);
      }),
    function (documents) {
      let document = (documents && documents.length)
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
  return fsutils.moveFile(files.src, files.dest)
    .then(function () {
      const document = updateDocument(new Document.model(), files.src, opts);
      return {
        document: document,
        representations: createRepresentations(document, assessments)
      };
    });
}

function renameStrategy(files,
                        assessments,
                        opts) {
  files.dest = fsutils.createFileData(uuid.v4() + path.extname(files.src.filename), constants.directories.documents);
  files.dest.originalname = files.src.filename;
  files.dest.stats = files.src.stats;
  return fsutils.moveFile(files.src, files.dest)
    .then(function () {
      const document = updateDocument(new Document.model(), files.dest, opts);
      return {
        document: document,
        representations: createRepresentations(document, assessments)
      };
    });
}

const strategies = {
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
                                         assessmentId) => {
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
                                                                      representationsByAssessment) => {
    return memo.concat(_.values(representationsByAssessment));
  }, []);
  return _.values(mapByFilename.documents).concat(representationList);
}

function createRepresentationsFromFiles(bulkupload,
                                        jsonData,
                                        assessments,
                                        opts) {
  return fsutils.readDirectoryContents(opts)
    .reduce(function (memo,
                      filepath) {
      const files = {
        src: fsutils.createFileData(filepath)
      };
      if (!files.src.stats.isFile()) {
        return memo;
      }
      files.dest = fsutils.createFileData(filepath, opts.dest);
      const strategy = (files.dest.stats.isFile())
        ? strategies[bulkupload.conflicts]
        : strategies.create;

      return strategy(files, assessments, opts)
        .then(function (result) {
          const filename = result.document.file.originalname;
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
  const filenames = _.keys(jsonData);
  const q = {
    "file.originalname": {$in: filenames}
  };
  return documentsService.list(q)
  // .then(function (documents) {
  //   return documents;
  // })
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

function handleFiles(bulkupload) {
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
    json: fsutils.retrieveJSONData(opts),
    assessments: assessmentsService.listById(bulkupload.assessment)
  });
  if (zipfile) {
    opts.dest = constants.directories.documents;
    opts.temp = path.resolve(constants.directories.bulk, bulkupload._rid.toString());
    opts.file = path.resolve(constants.directories.bulk, zipfile);
    p = p.then(function (data) {
      return fsutils.extractZipfile(opts)
        .then(function (unused) {
          return createRepresentationsFromFiles(bulkupload, data.json, data.assessments, opts);
        });
    });
  } else {
    p = p.then(function (data) {
      return createRepresentationsFromJSON(bulkupload, data.json, data.assessments, opts);
    });
  }

  return p.catch(function (err) {
    return P.reject(err);
  })
    .then(function () {
      return fsutils.cleanup([opts.file, opts.json], [opts.temp]);
    })
    .then(function (results) {
      bulkupload.completed = true;
      return null;
    });
}

function handleManualTexts(bulkupload) {
  const documents = bulkupload.assessment.reduce(function (memo,
                                                           assessmentId) {
    const documents = bulkupload.texts.map(function (text) {
      return new Document.model({
        text: text,
        representation: true,
        assessment: assessmentId
      });
    });
    memo.push(...documents);
    return memo;
  }, []);

  return P.mapSeries(documents, (doc) => doc.save())
    .then(function (results) {
      bulkupload.completed = true;
      return null;
    })
    .catch(err => P.reject(err));
}


function handleCSVTexts(bulkupload) {
  const csvFile = _.get(bulkupload, ['csvfile', 'filename'], false);
  // const csvFile = bulkupload.csvfile.filename;
  const opts = {
    path: path.resolve(constants.directories.bulk, csvFile)
  };
  return convertersService.textsCSVtoJSON(opts)
    .then(function (textObjects) {
      return bulkupload.assessment.reduce(function (memo, assessmentId) {
        const documents = textObjects.map(function (textObj) {
          return new Document.model(Object.assign({
            representation: true,
            assessment: assessmentId
          }, textObj));
        });
        memo.push(...documents);
        return memo;
      }, []);
    })
    .then(function (documents) {
      return P.mapSeries(documents, (doc) => doc.save());
    })
    .then(function (results) {
      return fsutils.cleanup([opts.path]);
    })
    .then(function (results) {
      bulkupload.completed=true;
      return null;
    });
}

function handleJIRA(bulkupload) {
  const csvFile = _.get(bulkupload, ['csvfile', 'filename'], false);
  // const csvFile = bulkupload.csvfile.filename;
  const opts = {
    path: path.resolve(constants.directories.bulk, csvFile)
  };
  return convertersService.jiraCSVtoJSON(opts)
    .then(function (jiraObjects) {
      jiraObjects.shift(); //remove headers
      return bulkupload.assessment.reduce(function (memo, assessmentId) {
        const documents = jiraObjects.map(function (jiraObj) {
          return new Document.model(Object.assign({
            representation: true,
            assessment: assessmentId
          }, jiraObj));
        });
        memo.push(...documents);
        return memo;
      }, []);
    })
    .then(function (documents) {
      return P.mapSeries(documents, (doc) => doc.save());
    })
    .then(function (results) {
      return fsutils.cleanup([opts.path]);
    })
    .then(function (results) {
      bulkupload.completed=true;
      return null;
    });
}

function bulkrepresentationSavedHandler(bulkupload) {
  if (bulkupload.completed && !keystone.get('dev env')) {
    return P.reject(new Error('You cannot reuse bulk uploads. (Seriously that would mean a world of pain)'));
  }

  if (bulkupload.isNew) {
    return P.resolve();
  }

  let p;
  switch (bulkupload.bulktype) {
    case "files":
      p = handleFiles(bulkupload);
      break;
    case "texts-manual":
      p = handleManualTexts(bulkupload);
      break;
    case "texts-csv":
      p = handleCSVTexts(bulkupload);
      break;
    case "jira":
      p = handleJIRA(bulkupload);
      break;
    default:
      return P.reject(new Error('Unknown bulk type'));
  }

  return p.then(function () {
    bulkupload.log += "Bulk representations successfully completed.";
  })
    .catch(function (err) {
      bulkupload.log += "Bulk representations failed: " + err.message;
    });
}

module.exports.init = function () {
  keystone.list('Bulkrepresentation').schema.pre('save', handleHook(bulkrepresentationSavedHandler));
};
