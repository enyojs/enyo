require('enyo');

/**
* Contains the declaration for the {@link enyo.DataTable} kind.
* @module enyo/DataTable
*/

var
	kind = require('./kind');
var
	DataRepeater = require('./DataRepeater'),
	Table = require('./Table'),
	TableRow = require('./TableRow');

/**
* {@link enyo.DataTable} enables the creation of data-driven tables.
* Along with {@link enyo.Table}, this is a work in progress.
*
* @namespace enyo
* @class enyo.DataTable
* @extends enyo.DataRepeater
* @ui
* @definedby module:enyo/DataTable
* @public
*/
module.exports = kind(
	/** @lends enyo.DataTable.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.DataTable',

	/**
	* @private
	*/
	kind: DataRepeater,

	/**
	* @private
	*/
	defaultKind: TableRow,

	/**
	* @private
	*/
	style: 'display: table;',

	/**
	* @private
	*/
	containerOptions: {
		kind: Table,
		name: 'container',
		style: 'width: 100%;'
	}
});
