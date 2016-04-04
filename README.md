# gulp-revise

Opinionated, straight to the point assets revisioning.

*Mostly inspired by [gulp-rev](https://github.com/sindresorhus/gulp-rev).*

## Example

```
dist/
    vendors.js.rev
    vendors_d41d8cd98f.js
    vendors_d41d8cd98f.js.map
    app.js.rev
    app_273c2cin3f.js
    app_273c2cin3f.js.map
src/
    vendors.js
    app.js
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
    .pipe(sourcemaps.write('.'))
    .pipe(revise())
    .pipe(revise.write('dist'))
    .pipe(gulp.dest('dist'))
  ;
});
```

**vendors.js.rev**

```
vendors_d41d8cd98f.js
```

**app.js.rev**

```
app_273c2cin3f.js
```

## Change Log

### v0.0.2 - 2016-04-04

* Update documentation and related links.

### v0.0.1 - 2016-04-04

*First release.*
