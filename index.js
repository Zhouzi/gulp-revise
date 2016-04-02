var fs = require('fs');
var path = require('path');
var Transform = require('stream').Transform;
var revHash = require('rev-hash');

// we need to implement a custom rename function
// to deal with file names such as scripts.js.map
// where the usual path.ext would return ".map"
function rename (name, suffix) {
  var dir = path.dirname(name);
  var fileName = path.basename(name);
  var partials = fileName.split('.');
  var root = partials[0];
  var exts = '.' + partials.slice(1).join('.');

  return path.join(dir, root + '_' + suffix + exts);
}

module.exports = function revision () {
  var stream = new Transform({ objectMode: true });

  stream._transform = function (originalFile, encoding, callback) {
    // we need to backup the original file's name
    // to create the revision file
    var originalFileName = path.basename(originalFile.path);

    var hash = revHash(originalFile.contents);
    originalFile.path = rename(originalFile.path, hash);
    this.push(originalFile);

    // the original file's path property is mutated
    // after it has been pushed so it now holds its new path
    var newPathToOriginalFile = path.dirname(originalFile.path);
    var newOriginalFileName = path.basename(originalFile.path);
    var pathToRevision = path.join(newPathToOriginalFile, originalFileName + '.rev');

    // by cloning the original file
    // we do not have to pull the vinyl package
    // and set each of the file's property manually
    // e.g: https://github.com/floridoo/gulp-sourcemaps/blob/master/index.js#L318
    var revisionFile = originalFile.clone({ contents: false });

    revisionFile.path = pathToRevision;
    revisionFile.contents = new Buffer(newOriginalFileName);
    this.push(revisionFile);

    fs.readFile(pathToRevision, 'utf8', function (err, oldFileName) {
      if (err) {
        // the revision file doesn't exist
        callback();
        return;
      }

      if (newOriginalFileName == oldFileName) {
        // if the old file name is the same as the new one
        // then we shouldn't delete it
        callback();
        return;
      }

      var dir = path.dirname(pathToRevision);
      var pathToFile = path.join(dir, oldFileName);
      fs.unlink(pathToFile, function () { callback(); });
    });
  };

  return stream;
};
