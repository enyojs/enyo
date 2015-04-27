'use strict';
var
	gl = require('./lib/global');

exports = module.exports = require('./lib/options');
exports.version = '2.6.0-pre';
exports.include = gl.include ? gl.include.bind(gl, 'enyo') : function () {};