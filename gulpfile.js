'use strict';

var
	util = require('util');

var
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	concat = require('gulp-concat'),
	enyo = require('enyo-dev'),
	through = require('through2'),
	mochaPhantomJs = require('gulp-mocha-phantomjs');

var
	opts = {
		package: '.',
		outdir: './test/dist',
		sourceMaps: false,
		clean: true,
		cache: false
	};

gulp.task('default', ['jshint', 'test']);
gulp.task('jshint', lint);
gulp.task('build-lib', buildLib);
gulp.task('build-tests', buildTests);
gulp.task('test', ['build-lib', 'build-tests'], test);

function lint () {
	return gulp
		.src('./src/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish, {verbose: true}))
		.pipe(jshint.reporter('fail'));
}

function buildLib (done) {
	// returns a promise that gulp should be waiting for
	return enyo.package(opts);
}

function buildTests () {
	return gulp
		.src('./test/tests/**/*.js')
		.pipe(wrap())
		.pipe(concat('tests.js'))
		.pipe(gulp.dest('./test/dist'));
}

// since the original tests were written to be modules, for now we will simply wrap
// their content to preserve the assumed safe-context
function wrap () {
	return through.obj(function (file, nil, next) {
		var body, wrapped;
		body = file.contents.toString('utf8');
		wrapped = util.format('(function () {\n%s\n})();\n', body);
		file.contents = new Buffer(wrapped);
		next(null, file);
	});
}

function test () {
	return gulp
		.src('./test/index.html')
		.pipe(mochaPhantomJs({reporter: 'spec', phantomjs: {useColors: true}}));
}