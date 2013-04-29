(function (enyo) {

	//*@public
	/**
		This binding is designed to work with its source or target
		being an _input_ with an optional _placeholder_ value. This
		will keep an input from showing an ugly undefined when there
		is no content and instead propagate the _placeholder_ value
		to the opposite end.
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

	});
	
})(enyo);
