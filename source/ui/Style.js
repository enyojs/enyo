(function (enyo, scope) {
	/**
	* {@link enyo.Style} is a wrapper for a [&lt;style&gt;]{@glossary style} tag;
	* it automatically wraps the [content]{@link enyo.Control#content} property
	* with proper CSS comment formatting.
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
		contentChanged: function () {
			this.content = '<!--\n' + this.content + '\n-->';
			this.inherited(arguments);
		}
	});

})(enyo, this);
