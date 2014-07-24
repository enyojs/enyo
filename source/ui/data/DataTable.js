(function (enyo, scope) {
	/**
	* _enyo.DataTable_ enables the creation of data-driven tables. 
	* Along with [_enyo.Table_]{@link enyo.Table}, this is a work in progress.
	*
	* @ui
	* @class enyo.DataTable
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
