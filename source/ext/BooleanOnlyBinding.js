(function (enyo, scope) {

	var Binding = enyo.Binding;

	/**
	* An {@link enyo.Binding} that will only propagate changes if the value is a {@glossary Boolean}.
	*
	* @class enyo.BooleanOnlyBinding
	* @extends enyo.Binding
	* @public
	*/
	enyo.kind(
		/** @lends enyo.BooleanOnlyBinding.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.BooleanOnlyBinding',
		
		/**
		* @private
		*/
		kind: Binding,
		
		/**
		* @private
		*/
		transform: function (value, direction, binding) {
			return (typeof value == 'boolean') ? value : binding.stop();
		}
	});

})(enyo, this);