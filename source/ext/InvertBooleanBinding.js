(function (enyo, scope) {

	var Binding = enyo.Binding;

	/**
	* A {@link enyo.Binding} designed to inverse a {@glossary Boolean} value.
	*
	* @class enyo.InvertBooleanBinding
	* @extends enyo.Binding
	* @public
	*/
	enyo.kind(
		/** @lends enyo.InvertBooleanBinding.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.InvertBooleanBinding',
		
		/**
		* @private
		*/
		kind: Binding,
		
		/**
		* @private
		*/
		transform: function (value) {
			return ! value;
		}
	});
	
})(enyo, this);
