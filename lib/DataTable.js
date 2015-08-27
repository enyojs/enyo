require('enyo');

/**
* Contains the declaration for the {@link module:enyo/DataTable~DataTable} kind.
* @module enyo/DataTable
*/

var
	kind = require('./kind');
var
	DataRepeater = require('./DataRepeater'),
	Table = require('./Table'),
	TableRow = require('./TableRow');

/**
* {@link module:enyo/DataTable~DataTable} enables the creation of data-driven tables.
* Along with {@link module:enyo/Table~Table}, this is a work in progress.
*
* @class DataTable
* @extends module:enyo/DataRepeater~DataRepeater
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:enyo/DataTable~DataTable.prototype */ {

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
	},

	// Accessibility

	/**
	* @private
	*/
	ariaObservers: [
		{to: 'role', value: 'grid'}
	]
});
