(function (enyo, scope) {
	/**
	* {@link enyo.TextArea} implements an HTML [&lt;textarea&gt;]{@glossary textarea}
	* element with cross-platform support for change [events]{@glossary event}.
	*
	* For more information, see the documentation on
	* [Text Fields]{@linkplain $dev-guide/building-apps/controls/text-fields.html}
	* in the Enyo Developer Guide.
	*
	* @class enyo.TextArea
	* @extends enyo.Input
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.TextArea.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.TextArea',

		/**
		* @private
		*/
		kind: 'enyo.Input',

		/**
		* @private
		*/
		tag: 'textarea',

		/**
		* @private
		*/
		classes: 'enyo-textarea',

		/**
		* [TextArea]{@link enyo.TextArea} does use the [value]{@link enyo.Input#value} attribute;
		* it needs to be kicked when rendered.
		*
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.valueChanged();
			};
		})
	});

})(enyo, this);
