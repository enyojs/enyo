require('enyo');

var
	kind = require('./kind');
var
	Control = require('./Control'),
	TableCell = require('./TableCell');

/**
* {@link enyo.TableRow} implements an HTML [&lt;tr&gt;]{@glossary tr} element.
*
* @class enyo.TableRow
* @extends enyo.Control
* @ui
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
	tag: 'tr',

	/**
	* @private
	*/
	defaultKind: TableCell
});