(function (enyo) {
	
	//*@public
	/**
		_enyo.BooleanBinding_ is a binding that will type-cast any truthy or falsey
		value to an explicit boolean value.
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
