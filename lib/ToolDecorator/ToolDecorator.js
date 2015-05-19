require('enyo');

/**
* Contains the declaration for the {@link enyo.ToolDecorator} kind.
* @module enyo/ToolDecorator
*/



var
	kind = require('../kind');
var
	GroupItem = require('../GroupItem');

/**
* {@link enyo.ToolDecorator} lines up [components]{@link enyo.Component} in a row,
* centered vertically.
*
* @namespace enyo
* @class enyo.ToolDecorator
* @extends enyo.GroupItem
* @ui
* @definedby module:enyo/ToolDecorator
* @public
*/
module.exports = kind(
	/** @lends enyo.ToolDecorator.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.ToolDecorator',

	/**
	* @private
	*/
	kind: GroupItem,

	/**
	* @private
	*/
	classes: 'enyo-tool-decorator'
});
