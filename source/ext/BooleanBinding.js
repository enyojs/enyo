(function (enyo) {
	
	//*@public
	/**
		This binding will type-cast any truthy | falsey value
		to an explicit boolean value.
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.BooleanBinding",

		//*@public
		kind: "enyo.Binding",

		// ...........................
		// PROTECTED METHODS

		//*@protected
		transform: function (value, direction, binding) {
			return !! value;
		}

	});
	
})(enyo);
