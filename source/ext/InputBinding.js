//*@public
/**
	_enyo.InputBinding_ is a binding designed to have its source or target be an
	_input_ with an optional _placeholder_ value. This keeps the input from
	showing _undefined_ when there is no content, as the _placeholder_ value will
	then be used for display.
*/
enyo.kind({
	name: "enyo.InputBinding",
	kind: enyo.Binding,
	oneWay: false,
	//*@protected
	transform: function (value, direction, binding) {
		if (value) { return value; }
		var s = binding.source || {},
			t = binding.target || {},
			// we attempt to find the placeholder at either end, prioritizing
			// to checking the source
			ph = s.placeholder || t.placeholder || "";
		return ph;
	}
});
