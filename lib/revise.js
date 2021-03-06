var path = require('path');
var revHash = require('rev-hash');
var through = require('through2');
var isFileSupported = require('./isFileSupported');

function revise () {
  return through.obj(
    function transform (file, encoding, callback) {
      if (file.isNull()) {
        callback(null, file);
        return;
      }

      var error = isFileSupported(file);
      if (error) {
        callback(error);
        return;
      }

      var hash = revHash(file.contents);

      file.beforeRev = file.path;
      file.path = rename(file.path, hash);

      if (file.sourceMap) {
        file.sourceMap.file = file.relative;
      }

      this.push(file);
      callback();
    }
  );
}

function rename (name, suffix) {
  var dir = path.dirname(name);
  var ext = path.extname(name);
  var fileName = path.basename(name, ext);

  return path.join(dir, fileName + '_' + suffix + ext);
}

module.exports = revise;
