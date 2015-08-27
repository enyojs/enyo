require('enyo');

/**
* Contains the declaration for the {@link module:enyo/TableCell~TableCell} kind.
* @module enyo/TableCell
*/

var
	kind = require('../kind');
var
	Control = require('../Control');

/**
* {@link module:enyo/TableCell~TableCell} implements an HTML [&lt;td&gt;]{@glossary td} element.
*
* @class TableCell
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/TableCell~TableCell.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.TableCell',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	tag: 'td',

	// Accessibility

	/**
	* @default gridcell
	* @type {String}
	* @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
	* @public
	*/
	accessibilityRole: 'gridcell'
});
