/*jshint node:true */
'use strict';

/**
* Returns the global enyo options hash
* @module enyo/options
*/

module.exports = (global.enyo && global.enyo.options) || {};
