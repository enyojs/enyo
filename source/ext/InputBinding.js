(function (enyo, scope) {

	var Binding = enyo.Binding;

	/**
	* A {@link enyo.Binding} designed to have its {@link enyo.Binding#source} or its
	* {@link enyo.Binding#target} be an {@link enyo.Input}. If the {@link enyo.Input} has a
	* [placeholder]{@link enyo.Input#placeholder} it will use that when there is no value. This is
	* a [two-way]{@link enyo.Binding#oneWay} {@link enyo.Binding}.
	*
	* @class enyo.InputBinding
	* @extends enyo.Binding
	* @public
	*/
	enyo.kind(
		/** @lends enyo.InputBinding.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.InputBinding',
		
		/**
		* @private
		*/
		kind: Binding,
		
		/**
		* This should be set to either 'source' or 'target' depending on which end is the
		* {@link enyo.Input} so it will not use the
		* [placeholder]{@link enyo.InputBinding#placeholder} in the wrong direction.
		*
		* @type {String}
		* @default 'source'
		* @public
		*/
		placeholderDirection: 'source',
		
		/**
		* @private
		*/
		oneWay: false,
		
		/**
		* @private
		*/
		transform: function (value, direction, binding) {
			if (value) { return value; }
			var pd = binding.placeholderDirection,
				ph = binding[pd].placeholder || '';
			return ph;
		}
	});

})(enyo, this);