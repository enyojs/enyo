'use strict';

var
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish');



gulp.task('default', ['jshint']);
gulp.task('jshint', lint);



function lint () {
	return gulp
		.src('./lib/**.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish, {verbose: true}))
		.pipe(jshint.reporter('fail'));
}	