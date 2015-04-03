'use strict';

var
	fs = require('fs-extra'),
	path = require('path');

var
	gulp = require('gulp'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	maps = require('gulp-sourcemaps');

var
	find = require('./lib/find-modules'),
	styled = require('./lib/styled');


gulp.task('default', ['development']);
gulp.task('move-modules', moveModules);
gulp.task('kitchen-sink', ['move-modules'], kitchenSink);
gulp.task('development', ['move-modules'], development);
gulp.task('clean', clean);


function moduleName (file) {
	var idx = file.lastIndexOf('.');
	
	if (idx === -1) return path.basename(file);
	else return path.basename(file.slice(0, idx));
}

function development () {
	var
		dest = './dist/development',
		modules = fs
			.readdirSync(path.join(__dirname, './build'))
			.map(function (file) { return path.join(__dirname, './build/', file); }),
		bundle = browserify({debug: true, paths: ['build']});
	
	bundle.plugin(styled, {outdir: dest, outfile: 'development.css'});
	
	modules.forEach(function (module) {
		var expose = 'enyo/' + moduleName(module);
		
		bundle.require(module, {expose: expose});
	});
	
	return bundle
		.bundle()
		.pipe(source('development.js'))
		.pipe(buffer())
		.pipe(maps.init({loadMaps: true}))
		.pipe(maps.write())
		.pipe(gulp.dest(dest));
}


function kitchenSink () {
	var
		dest = './dist/kitchen-sink',
		bundle = browserify({paths: ['build'], debug: true});
	
	return bundle
		.require('./lib/builds/kitchen-sink.js', {expose: 'enyo'})
		.plugin(styled, {outdir: dest, outfile: 'enyo-ks.css'})
		.bundle()
		.pipe(source('enyo-ks.js'))
		.pipe(buffer())
		.pipe(maps.init({loadMaps: true}))
		.pipe(maps.write())
		.pipe(gulp.dest(dest));
}


function clean () {
	fs.deleteSync(path.resolve(__dirname, './build'));
	fs.deleteSync(path.resolve(__dirname, './dist'));
}




function moveModules (done) {

	var modules = find(path.resolve(__dirname, './src'));

	fs.ensureDirSync(path.resolve(__dirname, './build'));

	// copy the modules to build
	modules.forEach(function (module) {
		fs.copySync(module, path.resolve(__dirname, './build/', path.basename(module)));
	});
	
	done();
}