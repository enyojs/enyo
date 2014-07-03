(function (enyo, scope) {
	/*
	* TODO: Won't work in IE8 because we can't set innerHTML on table elements. We'll need to fall 
	* back to divs with table display styles applied.
	* 
	* Should also facade certain useful table functionality (specific set TBD).
	*/

	/**
	* _enyo.Table_ implements an HTML [&lt;table&gt;]{@link external:table} element. This is a work 
	* in progress.
	*
	* @class enyo.Table
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
	* _enyo.TableRow_ implements an HTML [&lt;tr&gt;]{@link external:tr} element.
	*
	* @class enyo.TableRow
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
		tag: 'tr',

		/**
		* @private
		*/
		defaultKind: 'enyo.TableCell'
	});

	/**
	* _enyo.TableCell_ implements an HTML [&lt;td&gt;]{@link external:td} element.
	*
	* @class enyo.TableCell
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
		tag: 'td'
	});

})(enyo, this);
