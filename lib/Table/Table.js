require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Table~Table} kind.
* @module enyo/Table
*/

var
	kind = require('../kind');
var
	Control = require('../Control'),
	TableRow = require('../TableRow');

/*
* TODO: Won't work in IE8 because we can't set innerHTML on table elements. We'll need to fall 
* back to divs with table display styles applied.
* 
* Should also facade certain useful table functionality (specific set TBD).
*/

/**
* {@link module:enyo/Table~Table} implements an HTML [&lt;table&gt;]{@glossary table} element.
* This is a work in progress.
*
* @class Table
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Table~Table.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Table',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	tag: 'table',

	/**
	* @private
	*/
	attributes: {
		cellpadding: '0',
		cellspacing: '0'
	},

	/**
	* @private
	*/
	defaultKind: TableRow,

	// Accessibility

	/**
	* @default grid
	* @type {String}
	* @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
	* @public
	*/
	accessibilityRole: 'grid'
});
