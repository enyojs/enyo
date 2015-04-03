require('enyo');

var
	kind = require('./kind');
var
	Control = require('./Control');

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
	tag: 'td'
});