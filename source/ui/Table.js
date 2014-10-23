(function (enyo, scope) {
	/*
	* TODO: Won't work in IE8 because we can't set innerHTML on table elements. We'll need to fall 
	* back to divs with table display styles applied.
	* 
	* Should also facade certain useful table functionality (specific set TBD).
	*/

	/**
	* {@link enyo.Table} implements an HTML [&lt;table&gt;]{@glossary table} element.
	* This is a work in progress.
	*
	* @class enyo.Table
	* @extends enyo.Control
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Table.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Table',

		/**
		* @private
		*/
		kind: 'enyo.Control',

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
		defaultKind: 'enyo.TableRow'
	});

	/**
	* {@link enyo.TableRow} implements an HTML [&lt;tr&gt;]{@glossary tr} element.
	*
	* @class enyo.TableRow
	* @extends enyo.Control
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.TableRow.prototype */ {
	
		/**
		* @private
		*/
		name: 'enyo.TableRow',

		/**
		* @private
		*/
		kind: 'enyo.Control',

		/**
		* @private
		*/
		tag: 'tr',

		/**
		* @private
		*/
		defaultKind: 'enyo.TableCell'
	});

	/**
	* {@link enyo.TableCell} implements an HTML [&lt;td&gt;]{@glossary td} element.
	*
	* @class enyo.TableCell
	* @extends enyo.Control
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.TableCell.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.TableCell',

		/**
		* @private
		*/
		kind: 'enyo.Control',

		/**
		* @private
		*/
		tag: 'td'
	});

})(enyo, this);
