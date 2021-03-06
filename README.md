# gulp-revise

Opinionated, straight to the point assets revisioning.

* [Example](#example)
* [Documentation](#documentation)
* [Change Log](#change-log)

*Mostly inspired by [gulp-rev](https://github.com/sindresorhus/gulp-rev).*

## Example

```
dist/
    app.js.rev
    app_273c2cin3f.js
    app_273c2cin3f.js.map
    vendors.js.rev
    vendors_d41d8cd98f.js
    vendors_d41d8cd98f.js.map
src/
    app.js
    vendors.js
gulpfile.js
```

**gulpfile.js**

```javascript
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var revise = require('gulp-revise');

gulp.task('default', function () {
  return gulp
    .src('src/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(revise())
    .pipe(sourcemaps.write('.'))
    .pipe(revise.write())
    .pipe(gulp.dest('dist'))
  ;
});
```

**app.js.rev**

```
app_273c2cin3f.js
```

**vendors.js.rev**

```
vendors_d41d8cd98f.js
```

## Documentation

### revise()

Adds the `_hash` suffix to the files in the stream (`hash` being the md5 of the file's content).

### revise.write()

For each files that have been revised, creates a `.rev` file that contains the file's name.
e.g `app.js` is renamed to `app_273c2cin3f.js` so the `app.js.rev` contains `app_273c2cin3f.js`.

#### path

The path to look for existing `.rev` file so it can delete old revisions.
Should be the same as the one passed to `gulp.dest()`.

Note: also delete the corresponding `.map` files.

### revise.merge(basePath = process.cwd())

Merge the `.rev` files in the stream to create a `rev-manifest.json` file, e.g:

```javascript
var gulp = require('gulp');
var revise = require('gulp-revise');

gulp.task('merge', function () {
  return gulp
    .src('dist/*.rev')
    .pipe(revise.merge())
    .pipe(gulp.dest(''));
});
```

`rev-manifest.json` looks like this:

```json
{
  "dist/app.js": "dist/app_273c2cin3f.js",
  "dist/vendors.js": "dist/vendors_d41d8cd98f"
}
```

By default, basePath is set to `process.cwd()` which assumes the current working directory to be the root.
However, you can pass a custom base path, e.g:

```javascript
var gulp = require('gulp');
var revise = require('gulp-revise');

gulp.task('merge', function () {
  return gulp
    .src('dist/*.rev')
    .pipe(revise.merge('dist'))
    .pipe(gulp.dest(''));
});
```

Will result in:

```json
{
  "app.js": "app_273c2cin3f.js",
  "vendors.js": "vendors_d41d8cd98f"
}
```

### revise.noop()

noop utility that just adds the required props to the files for `.write()` to work as usual.
That way the `.rev` files are properly updated with the file's name, no hash added.

Example:

```javascript
// var revise = require('gulp-revise');
if (isWatching) {
  stream = stream.pipe(revise.noop());
} else {
  stream = stream.pipe(revise());
}
```

## Change Log

### v2.0.0 - 2017-02-16

* Add basePath option to `.merge()`
  * This is a breaking change: the path to the file was not added until now. If you still want to just have the file names, pass the base path as an argument to `.merge()`.

### v1.1.1 - 2016-12-03

* fix `write()` to work with sub directories [#3](https://github.com/Zhouzi/gulp-revise/issues/3)

### v1.1.0 - 2016-12-01

* ~~`write()` no more requires the dest path (also fixes [#3](https://github.com/Zhouzi/gulp-revise/issues/3))~~

*Sadly, this version actually introduced a regression.*

### v1.0.0 - 2016-08-19

* Remove `restore()`
* Add `noop()` as a replacement for `restore()`

### v0.0.6 - 2016-04-26

* Add `restore()` to rename files after their .rev

### v0.0.5 - 2016-04-16

* Added checks to prevent facing unusual errors.

### v0.0.4 - 2016-04-12

* Fixed an issue regarding the generation of source maps.

### v0.0.3 - 2016-04-05

* Update documentation.

### v0.0.2 - 2016-04-04

* Update documentation and related links.

### v0.0.1 - 2016-04-04

*First release.*
