'use strict';

var
	fs = require('fs'),
	path = require('path');
var
	gulp = require('gulp'),
	packageStyle = require('./package-style'),
	isArray = Array.isArray;
var
	File = require('vinyl');



/**
* A plugin for Browserify that looks for a "style" property in any modules encountered then passes
* them to a separate stream that handles packaging them.
*/
module.exports = function (bundle, opts) {
	
	var styleStream = packageStyle(opts);
	
	// when the final css file is generated we want to write it to the correct location
	styleStream.pipe(gulp.dest(opts.outdir));
	
	function finalize () {
		styleStream.end();
	}
	
	// we need to know when bundling is complete as an indicator that we will not receive any
	// more packages to explore
	bundle.on('bundle', function (stream) { stream.on('end', finalize); });
	
	// this event is emitted when a package is read, including the root packages from
	// unrelated modules, so we need to be careful about which ones we accept
	bundle.on('package', function (pkg) {
		var dir = pkg.__dirname;
		
		// if the package is from inside of node_modules we ignore it
		if (!/node_modules/.test(dir) && isArray(pkg.style)) {
			pkg.style.forEach(function (file) {
				var
					fullPath = path.resolve(dir, file),
					stats;
				
				try {
					stats = fs.statSync(fullPath);
					if (stats.isFile()) {
						// create the file for the stream and pass it along
						file = new File({path: fullPath, contents: fs.readFileSync(fullPath)});
						styleStream.write(file);
					} else {
						console.error('Cannot handle requested file "' + fullPath + '"');
					}
				} catch (e) {
					console.error('Could not find requested file "' + fullPath + '" from "' + dir + '"');
				}
			});
		}
	});
	
	
};