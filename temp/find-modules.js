'use strict';

// for now this assumes a structure that is never deeper than one level, pretty easy to change
// if ever that becomes necessary

var
	fs = require('fs'),
	path = require('path');

module.exports = acquire;

function acquire (rootDir) {
	var
		dirs = readDir(rootDir, filterRoot),
		modules = [];
	
	dirs.forEach(function (dir) {
		var subs = readDir(dir, filterModules);
		subs.forEach(function (sub) { modules.push(sub); });
	});
	
	return modules;
}

function readDir (dir, filter) {
	return fs.readdirSync(dir).filter(filter(dir)).map(function (file) { return path.resolve(dir, file); });
}

function filterRoot (rootDir) {
	return function (file) {
		var
			fullPath = path.resolve(rootDir, file),
			stats = fs.statSync(fullPath);
		return stats.isDirectory();
	};
}

function filterModules () {
	return function () { return true; };
}