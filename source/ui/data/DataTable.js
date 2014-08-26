(function (enyo, scope) {
	/**
	* {@link enyo.DataTable} enables the creation of data-driven tables.
	* Along with {@link enyo.Table}, this is a work in progress.
	*
	* @class enyo.DataTable
	* @extends enyo.DataRepeater
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.DataTable.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.DataTable',

		/**
		* @private
		*/
		kind: 'enyo.DataRepeater',

		/**
		* @private
		*/
		defaultKind: 'enyo.TableRow',

		/**
		* @private
		*/
		style: 'display: table;',

		/**
		* @private
		*/
		containerOptions: {
			kind: 'enyo.Table',
			name: 'container',
			style: 'width: 100%;'
		}
	});

})(enyo, this);
