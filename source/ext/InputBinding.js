//*@public
/**
*/
enyo.kind({

	// ...........................
	// PUBLIC PROPERTIES

	//*@public
	name: "enyo.InputBinding",

	//*@public
	kind: "enyo.Binding",

	//*@public
	twoWay: true,

	// ...........................
	// PROTECTED PROPERTIES

	// ...........................
	// COMPUTED PROPERTIES

	// ...........................
	// PUBLIC METHODS

	// ...........................
	// PROTECTED METHODS

	//*@protected
	transform: function (value, direction, binding) {
		var source = binding.source || {};
		var target = binding.target || {};
		var ph = source.placholder || target.placeholder || "";
		if (!enyo.exists(value) || null === value || value.length === 0) {
			return ph;
		} else {
			return value;
		}
	}

	// ...........................
	// OBSERVERS

});
