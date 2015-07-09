require('enyo');

/**
* Contains the declaration for the {@link module:enyo/ToolDecorator~ToolDecorator} kind.
* @module enyo/ToolDecorator
*/



var
	kind = require('../kind');
var
	GroupItem = require('../GroupItem');

/**
* {@link module:enyo/ToolDecorator~ToolDecorator} lines up [components]{@link module:enyo/Component~Component} in a row,
* centered vertically.
*
* @class ToolDecorator
* @extends module:enyo/GroupItem~GroupItem
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/ToolDecorator~ToolDecorator.prototype */ {

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
