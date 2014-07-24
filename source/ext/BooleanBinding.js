(function (enyo, scope) {
	
	var Binding = enyo.Binding;
	
	/**
	* An {@link enyo.Binding} that coerces any value passing through it to be a {@glossary Boolean}
	* value. Use this by setting the `kind` property of your binding declaration.
	*
	* @class enyo.BooleanBinding
	* @extends enyo.Binding
	* @public
	*/
	enyo.kind(
		/** @lends enyo.BooleanBinding.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.BooleanBinding',
		
		/**
		* @private
		*/
		kind: Binding,
		
		/**
		* @private
		*/
		transform: function (value) {
			return !! value;
		}
	});

	/**
	* An {@link enyo.Binding} that checks for empty values. Will be `true` if there is some
	* value, but `false` for an empty [string]{@glossary String}, `null`, or `undefined`.
	*
	* @class enyo.EmptyBinding
	* @extends enyo.Binding
	* @public
	*/
	enyo.kind(
		/** @lends enyo.EmptyBinding.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.EmptyBinding',
		
		/**
		* @private
		*/
		kind: Binding,
		
		/**
		* @private
		*/
		transform: function (value) {
			return (value !== '' && value != null);
		}
	});

})(enyo, this);