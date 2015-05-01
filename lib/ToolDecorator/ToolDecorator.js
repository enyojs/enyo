require('enyo');



var
	kind = require('../kind');
var
	GroupItem = require('../GroupItem');

/**
* {@link enyo.ToolDecorator} lines up [components]{@link enyo.Component} in a row,
* centered vertically.
*
* @class enyo.ToolDecorator
* @extends enyo.GroupItem
* @ui
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