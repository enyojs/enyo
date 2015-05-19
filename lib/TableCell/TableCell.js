require('enyo');

var
	kind = require('../kind'),
	options = require('../options');
var
	Control = require('../Control'),
	TableCellAccessibilitySupport = require('./TableCellAccessibilitySupport');

/**
* {@link enyo.TableCell} implements an HTML [&lt;td&gt;]{@glossary td} element.
*
* @class enyo.TableCell
* @extends enyo.Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends enyo.TableCell.prototype */ {

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