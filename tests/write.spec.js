var path = require('path');
var assert = require('assert');
var sinon = require('sinon');
var gutil = require('gulp-util');
var proxyquire = require('proxyquire');
var fs = require('fs');
var del = sinon.stub().returns(Promise.resolve());
var write = proxyquire('../lib/write', { fs: fs, del: del });

describe('write()', function () {
  beforeEach(function () {
    sinon.stub(fs, 'readFile');
  });

  afterEach(function () {
    fs.readFile.restore();
    del.reset();
  });

  it('should throw an error if output path is missing', function () {
    var stream = write();

    stream.on('error', function (err) {
      assert.equal(err.message, 'required argument "dest path" for revise.write() is missing');
    });

    var file = new gutil.File({
      path: 'src/app_d41d8cd98f.js',
      contents: new Buffer('')
    });

    file.beforeRev = 'src/app.js';

    stream.write(file);
  });

  it('should push the original file and create the .rev', function () {
    var stream = write('dist');
    var pushedOriginalFile = false;

    stream.on('data', function (file) {
      if (pushedOriginalFile) {
        assert.equal(file.path, path.join(__dirname, '../src/app.js.rev'));
        assert.equal(file.contents.toString(), 'app_d41d8cd98f.js');
        return;
      }

      pushedOriginalFile = true;
      assert.equal(file.path, 'src/app_d41d8cd98f.js');
    });

    var file = new gutil.File({
      path: 'src/app_d41d8cd98f.js',
      contents: new Buffer('')
    });

    file.beforeRev = 'src/app.js';

    stream.write(file);
  });

  it('should ignore files that miss the beforeRev prop', function () {
    var stream = write('dist');
    var spy = sinon.stub();

    stream.on('data', spy);

    stream.write(new gutil.File({
      path: 'src/app.js',
      contents: new Buffer('')
    }));

    assert.equal(spy.callCount, 1);
  });

  it('should read the existing revision', function () {
    var stream = write('dist');

    var file = new gutil.File({
      path: 'src/app_d41d8cd98f.js',
      contents: new Buffer('')
    });

    file.beforeRev = 'src/app.js';
    stream.write(file);

    assert.equal(fs.readFile.callCount, 1);
    assert.equal(fs.readFile.firstCall.args[0], path.join(__dirname, '../dist', 'app.js.rev'));
  });

  it('should delete the old revision', function () {
    var stream = write('dist');

    var file = new gutil.File({
      path: 'src/app_d41d8cd98f.js',
      contents: new Buffer('')
    });

    file.beforeRev = 'src/app.js';
    stream.write(file);

    fs.readFile.callArgWith(2, null, 'app_abcdef.js');

    assert.equal(del.callCount, 1);
    assert.deepEqual(del.firstCall.args, [
      [
        path.join(__dirname, '../dist', 'app_abcdef.js'),
        path.join(__dirname, '../dist', 'app_abcdef.js.map')
      ]
    ]);
  });

  it('should not delete the old revision if it\'s the same as the new one', function () {
    var stream = write('dist');

    var file = new gutil.File({
      path: 'src/app_d41d8cd98f.js',
      contents: new Buffer('')
    });

    file.beforeRev = 'src/app.js';
    stream.write(file);

    fs.readFile.callArgWith(2, null, 'app_d41d8cd98f.js');

    assert.equal(del.callCount, 0);
  });
});
