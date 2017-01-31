"use strict";

var gulp = require("gulp"),
    less = require("gulp-less"),
    path = require('path');

var paths = {
    less: "./assets/css/**/*.less"
};

gulp.task('less:compile', function () {
    return gulp.src(paths.less)
        .pipe(less({paths: [path.join(__dirname, 'less', 'includes')]}))
        .pipe(gulp.dest('./assets/css'));
});

gulp.task('default', ['less:compile']);