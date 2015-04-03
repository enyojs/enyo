'use strict';

var
	fs = require('fs'),
	path = require('path');
var
	File = require('vinyl');
var
	through = require('through2'),
	less = require('less');

module.exports = function (opts) {
	
	var
		files = [];
	
	function collect (file, nil, next) {
		
		files.push(file);
		
		next();
	}
	
	function end (done) {
		
		if (files.length) {
		
			var
				style = '',
				stream = this;
		
			files.forEach(function (file) {
				style += (file.contents.toString() + '\n');
			});
			
			less
				.render(style)
				.then(function (output) {
					
					var file = new File({
						path: opts.outfile,
						contents: new Buffer(output.css)
					});
					
					stream.push(file);
					done();
					
				}, function (err) {
					console.error(err);
					done();
				});
		}
	}
	
	return through.obj(collect, end);
	
};