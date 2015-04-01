(function (enyo, scope) {

	var Binding = enyo.Binding;

	/**
	* An {@link enyo.Binding} designed to invert a {@glossary Boolean} value.
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
