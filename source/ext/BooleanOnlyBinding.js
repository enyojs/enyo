(function (enyo) {

	//*@public
	/**
		_enyo.BooleanOnlyBinding_ is a binding that will only continue propagation
		if the value being passed is an explicit boolean value.
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.BooleanOnlyBinding",

		//*@public
		kind: "enyo.Binding",

		// ...........................
		// PROTECTED METHODS

		//*@protected
		transform: function (value, direction, binding) {
			if (value !== true && value !== false) {
				binding.stop();
			}
			return value;
		}

	});

})(enyo);
