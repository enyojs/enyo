(function (enyo, scope) {
	/**
	* _enyo.TextArea_ implements an HTML [&lt;textarea&gt;]{@link external:textarea} element with
	* cross-platform support for change [events]{@link external:event}.
	* 
	* For more information, see the documentation on [Text
	* Fields](building-apps/controls/text-fields.html) in the Enyo Developer Guide.
	*
	* @class enyo.TextArea
	* @extends enyo.Input
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
		* [TextArea]{@link enyo.TextArea} does use [value]{@link enyo.Input#value} attribute; needs 
		* to be kicked when rendered.
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
