/*
* grunt-browserify
* https://github.com/jmreidy/grunt-browserify
*
* Copyright (c) 2013 Justin Reidy
* Licensed under the MIT license.
*/
'use strict';
var Runner = require('../lib/runner');
var path = require('path');
var async = require('async');
var browserify = require('browserify');
var watchify = require('watchify');

module.exports = Task;

function Task (grunt) {
  grunt.registerMultiTask('browserify', 'Grunt task for browserify.', function () {

    // set default options
    var options = this.options({
      banner: ''
    });

    async.each(this.files, function (file, next) {
      Task.runTask(grunt, options, file, next);
    }, this.async());
  });
}

Task.runTask = function (grunt, options, file, next) {
  var runner = new Runner({
    writer: grunt.file,
    logger: grunt,
    browserify: browserify,
    watchify: watchify
  });
  var files = grunt.file.expand({filter: 'isFile'}, file.src).map(function (f) {
    return path.resolve(f);
  });
  runner.run(files, file.dest, options, next);
};
