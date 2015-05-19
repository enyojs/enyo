require('enyo');

/**
* Contains the declaration for the {@link enyo.TableCell} kind.
* @module enyo/TableCell
*/

var
	kind = require('../kind'),
	options = require('../options');
var
	Control = require('../Control'),
	TableCellAccessibilitySupport = require('./TableCellAccessibilitySupport');

/**
* {@link enyo.TableCell} implements an HTML [&lt;td&gt;]{@glossary td} element.
*
* @namespace enyo
* @class enyo.TableCell
* @extends enyo.Control
* @ui
* @definedby module:enyo/TableCell
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
