"use strict";

var gulp = require("gulp"),
    less = require("gulp-less"),
    path = require('path'),
    sourcemaps = require('gulp-sourcemaps'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    run = require('gulp-run'),
    replace = require('gulp-replace'),
    uglify = require('gulp-uglify'),
    pump = require('pump');

var paths = {
    webroot: "./assets/"
};
paths.less = paths.webroot + "css/**/*.less";

gulp.task('less:compile', function () {
    return gulp.src(paths.less)
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        })).pipe(gulp.dest('./assets/css'));
});

gulp.task('default', ['less:compile']);