(function (enyo, scope) {
	/**
	* _enyo.Style_ is a wrapper for a [style]{@link external:style} tag, which automatically wraps 
	* the [content]{@link enyo.Control#content} property in proper CSS commented format.
	*
	* @class enyo.Style
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Style.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Style',
		
		/**
		* @private
		*/
		tag: 'style',

		/**
		* @private
		*/
		classes: 'moon-style',

		/**
		* @private
		*/
		attributes: {
			type: 'text/css'
		},

		/**
		* @private
		*/
		allowHtml: true,

		/**
		* @private
		*/
		contentChanged: function() {
			this.content = '<!--\n' + this.content + '\n-->';
			this.inherited(arguments);
		}
	});

})(enyo, this);
