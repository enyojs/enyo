(function (enyo, scope) {

	var Binding = enyo.Binding;

	/**
	* An {@link enyo.Binding} designed to have its [source]{@link enyo.Binding#source}
	* or its [target]{@link enyo.Binding#target} be an {@link enyo.Input}. If the
	* `enyo.Input` has a [placeholder]{@link enyo.Input#placeholder}, it will be
	* used when there is no value. This is a [two-way]{@link enyo.Binding#oneWay} binding.
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
		* This should be set to either `'source'` or `'target'` depending on which end is the
		* {@link enyo.Input}, so that the [placeholder]{@link enyo.InputBinding#placeholder}
		* is not used in the wrong direction.
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
			var pd = '_' + binding.placeholderDirection,
				ph = binding[pd] && binding[pd].placeholder || '';
			return ph;
		}
	});

})(enyo, this);