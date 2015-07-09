require('enyo');

/**
* Contains the declaration for the {@link module:enyo/TableCell~TableCell} kind.
* @module enyo/TableCell
*/

var
	kind = require('../kind'),
	options = require('../options');
var
	Control = require('../Control'),
	TableCellAccessibilitySupport = require('./TableCellAccessibilitySupport');

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
	mixins: options.accessibility ? [TableCellAccessibilitySupport] : null,

	/**
	* @private
	*/
	tag: 'td'
});
