require('enyo');

/**
* Contains the declaration for the {@link enyo.TableRow} kind.
* @module enyo/TableRow
*/

var
	kind = require('../kind'),
	options = require('../options');
var
	Control = require('../Control'),
	TableCell = require('../TableCell'),
	TableRowAccessibilitySupport = require('./TableRowAccessibilitySupport');

/**
* {@link enyo.TableRow} implements an HTML [&lt;tr&gt;]{@glossary tr} element.
*
* @namespace enyo
* @class enyo.TableRow
* @extends enyo.Control
* @ui
* @definedby module:enyo/TableRow
* @public
*/
module.exports = kind(
	/** @lends enyo.TableRow.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.TableRow',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	mixins: options.accessibility ? [TableRowAccessibilitySupport] : null,

	/**
	* @private
	*/
	tag: 'tr',

	/**
	* @private
	*/
	defaultKind: TableCell
});
