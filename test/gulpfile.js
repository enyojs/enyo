'use strict';

var
	fs = require('fs'),
	path = require('path');

var
	gulp = require('gulp'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer');



gulp.task('build', buildTests);





function buildTests () {
	var
		bundle = browserify(),
		tests = getTests();
	// add each of the tests we found to the bundle as an entry without having one hard-coded
	tests.forEach(function (file) { bundle.add(file); });
	// the files in the library all require enyo but that is for building applications and
	// is only useful because of style ordering...
	bundle.ignore('enyo');
	return bundle
		.bundle()
		.pipe(source('tests.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./build'));
}

function getTests () {
	return fs.readdirSync(path.join(__dirname, './tests'))
		.filter(function (file) { return path.extname(file) == '.js'; })
		.map(function (file) { return path.join(__dirname, './tests/', file); });
}